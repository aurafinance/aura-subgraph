import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { Account, AccountPool } from "../generated/schema";
import { ZERO } from "./lib";

export function adjustAccount(pool: string, accountAddress: Address, staked: BigDecimal, depositted: BigDecimal): void {
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
    accountPool.depositted = ZERO.toBigDecimal()
    accountPool.staked = ZERO.toBigDecimal()
  }

  accountPool.depositted = accountPool.depositted.plus(depositted)
  accountPool.staked = accountPool.staked.plus(staked)

  accountPool.save()
}