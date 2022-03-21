import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Account, AccountPool } from '../generated/schema'
import { BaseRewardPool } from '../generated/templates/BaseRewardPool/BaseRewardPool'

export function adjustAccount(
  pool: string,
  accountAddress: Address,
  staked: BigDecimal,
  deposited: BigDecimal,
  rewardContractAddress: Address | null = null,
  timestamp: u32 = 0,
): void {
  let account = Account.load(accountAddress.toHex())
  if (account == null) {
    account = new Account(accountAddress.toHex())
    account.save()
  }

  let accountPoolId = accountAddress.toHex() + '-' + pool
  let accountPool = AccountPool.load(accountPoolId)
  if (accountPool == null) {
    accountPool = new AccountPool(accountPoolId)
    accountPool.account = accountAddress.toHex()
    accountPool.pool = pool
    accountPool.deposited = BigDecimal.zero()
    accountPool.staked = BigDecimal.zero()
    accountPool.userRewardPerTokenPaid = BigInt.zero()
    accountPool.rewards = BigInt.zero()
    accountPool.lastUpdatedTimestamp = 0
  }

  accountPool.deposited = accountPool.deposited.plus(deposited)
  accountPool.staked = accountPool.staked.plus(staked)

  if (rewardContractAddress) {
    let poolContract = BaseRewardPool.bind(rewardContractAddress)
    accountPool.userRewardPerTokenPaid =
      poolContract.userRewardPerTokenPaid(accountAddress)
    accountPool.rewards = poolContract.rewards(accountAddress)
    accountPool.lastUpdatedTimestamp = timestamp
  }

  accountPool.save()
}
