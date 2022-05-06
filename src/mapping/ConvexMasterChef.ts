import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  ConvexMasterChef,
  Deposit,
  EmergencyWithdraw,
  Withdraw,
} from '../../generated/ConvexMasterChef/ConvexMasterChef'
import {
  Account,
  MasterChef,
  MasterChefPoolInfo,
  MasterChefUserInfo,
} from '../../generated/schema'
import { getAccount } from '../accounts'
import { getToken } from '../tokens'

function getMasterChef(address: Address): MasterChef {

  let id = address.toHex()
  let masterChef = MasterChef.load(id)

  if (masterChef != null) {
    return masterChef as MasterChef
  }

  let convexMasterChef = ConvexMasterChef.bind(address)

  masterChef = new MasterChef(id)
  masterChef.rewardPerBlock = convexMasterChef.rewardPerBlock()
  masterChef.startBlock = convexMasterChef.startBlock()
  masterChef.endBlock = convexMasterChef.endBlock()
  masterChef.totalAllocPoint = convexMasterChef.totalAllocPoint()
  masterChef.save()

  return masterChef as MasterChef
}

function getMasterChefUserInfo(masterChef: MasterChef, account: Account): MasterChefUserInfo {
  let id = account.id
  let userInfo = MasterChefUserInfo.load(id)

  if (userInfo != null) {
    return userInfo as MasterChefUserInfo
  }

  userInfo = new MasterChefUserInfo(id)
  userInfo.masterChef = masterChef.id
  userInfo.account = account.id
  userInfo.amount = BigInt.zero()
  userInfo.rewardDebt = BigInt.zero()
  userInfo.save()

  return userInfo as MasterChefUserInfo
}

function getMasterChefPoolInfo(masterChef: MasterChef, pid: BigInt): MasterChefPoolInfo {
  let id = pid.toString()
  let poolInfo = MasterChefPoolInfo.load(id)

  if (poolInfo != null) {
    return poolInfo as MasterChefPoolInfo
  }

  let convexMasterChef = ConvexMasterChef.bind(Address.fromString(masterChef.id))
  let poolInfoResult = convexMasterChef.poolInfo(pid)

  poolInfo = new MasterChefPoolInfo(id)
  poolInfo.masterChef = masterChef.id
  poolInfo.lpToken = getToken(poolInfoResult.value0).id
  poolInfo.allocPoint = poolInfoResult.value1
  poolInfo.lastRewardBlock = poolInfoResult.value2
  poolInfo.accCvxPerShare = poolInfoResult.value3
  poolInfo.rewarder = poolInfoResult.value4
  poolInfo.save()

  return poolInfo as MasterChefPoolInfo
}

function updatePool(masterChef: MasterChef, poolInfo: MasterChefPoolInfo): void {
  let convexMasterChef = ConvexMasterChef.bind(Address.fromString(masterChef.id))
  let poolInfoResult = convexMasterChef.poolInfo(BigInt.fromString(poolInfo.id))
  poolInfo.lpToken = getToken(poolInfoResult.value0).id
  poolInfo.allocPoint = poolInfoResult.value1
  poolInfo.lastRewardBlock = poolInfoResult.value2
  poolInfo.accCvxPerShare = poolInfoResult.value3
  poolInfo.rewarder = poolInfoResult.value4
}

export function handleDeposit(event: Deposit): void {
  let masterChef = getMasterChef(event.address)
  let account = getAccount(event.params.user)
  let poolInfo = getMasterChefPoolInfo(masterChef, event.params.pid)
  let userInfo = getMasterChefUserInfo(masterChef, account)

  updatePool(masterChef, poolInfo)
  poolInfo.save()

  userInfo.amount = userInfo.amount.plus(event.params.amount)
  userInfo.rewardDebt = userInfo.amount.times(poolInfo.accCvxPerShare).div(BigInt.fromI32(1e12 as i32))
  userInfo.save()
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  let masterChef = getMasterChef(event.address)
  let account = getAccount(event.params.user)
  let userInfo = getMasterChefUserInfo(masterChef, account)
  userInfo.amount = BigInt.zero()
  userInfo.rewardDebt = BigInt.zero()
  userInfo.save()
}

export function handleWithdraw(event: Withdraw): void {
  let masterChef = getMasterChef(event.address)
  let account = getAccount(event.params.user)
  let poolInfo = getMasterChefPoolInfo(masterChef, event.params.pid)
  let userInfo = getMasterChefUserInfo(masterChef, account)

  updatePool(masterChef, poolInfo)
  poolInfo.save()

  userInfo.amount = userInfo.amount.minus(event.params.amount)
  userInfo.rewardDebt = userInfo.amount.times(poolInfo.accCvxPerShare).div(BigInt.fromI32(1e12 as i32))
  userInfo.save()
}
