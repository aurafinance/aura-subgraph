import { Address, BigInt } from '@graphprotocol/graph-ts'

import { PoolRewardData, Pool } from '../generated/schema'
import { BaseRewardPool } from '../generated/templates/BaseRewardPool/BaseRewardPool'
import { VirtualBalanceRewardPool } from '../generated/Booster/VirtualBalanceRewardPool'
import { getToken } from './tokens'

export function updatePoolRewardData(pool: Pool): void {
  let contract = BaseRewardPool.bind(Address.fromBytes(pool.rewardPool))
  let rewardToken = contract.try_rewardToken()
  if (rewardToken.reverted) return

  let token = getToken(rewardToken.value)

  let id = pool.id + '.' + token.id
  let rewardData = new PoolRewardData(id)

  rewardData.token = token.id
  rewardData.pool = pool.id
  rewardData.rewardPerTokenStored = contract.rewardPerTokenStored()
  rewardData.rewardRate = contract.rewardRate()
  rewardData.lastUpdateTime = contract.lastUpdateTime().toI32()
  rewardData.periodFinish = contract.periodFinish().toI32()

  rewardData.save()

  let extraRewardsLength = contract.try_extraRewardsLength()
  if (!extraRewardsLength.reverted) {
    for (let i = 0; i < extraRewardsLength.value.toI32(); i++) {
      let extraRewardsAddress = contract.extraRewards(BigInt.fromI32(i))
      if (extraRewardsAddress.notEqual(Address.zero())) {
        let extraRewardsContract = VirtualBalanceRewardPool.bind(extraRewardsAddress)

        let rewardsToken = getToken(extraRewardsContract.rewardToken())

        let id = pool.id + '.' + rewardsToken.id
        let rewardData = new PoolRewardData(id)
        rewardData.token = rewardsToken.id
        rewardData.pool = pool.id
        rewardData.rewardPerTokenStored = extraRewardsContract.rewardPerTokenStored()
        rewardData.rewardRate = extraRewardsContract.rewardRate()
        rewardData.lastUpdateTime = extraRewardsContract.lastUpdateTime().toI32()
        rewardData.periodFinish = extraRewardsContract.periodFinish().toI32()
        rewardData.save()
      }
    }
  }
}
