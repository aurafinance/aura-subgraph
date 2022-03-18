import { Address, BigDecimal } from '@graphprotocol/graph-ts'
import { Account, AccountPool } from '../generated/schema'
import { BaseRewardPool } from '../generated/templates/BaseRewardPool/BaseRewardPool'
import { ZERO } from './lib'

export function adjustAccount(
  pool: string,
  accountAddress: Address,
  staked: BigDecimal,
  deposited: BigDecimal,
  rewardContractAddress: Address | null = null,
  timestamp: u32 = 0,
): void {
  let account = Account.load(accountAddress.toHex())
  if (!account) {
    account = new Account(accountAddress.toHex())
    account.save()
  }

  let accountPoolId = accountAddress.toHex() + '-' + pool
  let accountPool = AccountPool.load(accountPoolId)
  if (!accountPool) {
    accountPool = new AccountPool(accountPoolId)
    accountPool.account = accountAddress.toHex()
    accountPool.pool = pool
    accountPool.deposited = ZERO.toBigDecimal()
    accountPool.staked = ZERO.toBigDecimal()
    accountPool.userRewardPerTokenPaid = ZERO
    accountPool.rewards = ZERO
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
