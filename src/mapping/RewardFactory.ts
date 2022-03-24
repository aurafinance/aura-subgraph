import { DataSourceContext } from '@graphprotocol/graph-ts'
import {
  AccessChanged,
  ActiveRewardAdded,
  ActiveRewardRemoved,
  RewardPoolCreated,
  TokenRewardPoolCreated,
} from '../../generated/templates/RewardFactory/RewardFactory'
import { BaseRewardPool } from '../../generated/templates'

export function handleAccessChanged(event: AccessChanged): void {
  // TODO
}

export function handleActiveRewardAdded(event: ActiveRewardAdded): void {
  // TODO
}

export function handleActiveRewardRemoved(event: ActiveRewardRemoved): void {
  // TODO
}

export function handleRewardPoolCreated(event: RewardPoolCreated): void {
  let pid = event.params._pid.toString()
  let context = new DataSourceContext()
  context.setString('pid', pid)
  BaseRewardPool.createWithContext(event.params.rewardPool, context)

  // The Booster mapping should be responsible for creating FactoryPool/RewardData entities
}

export function handleTokenRewardPoolCreated(
  event: TokenRewardPoolCreated,
): void {
  // TODO
}
