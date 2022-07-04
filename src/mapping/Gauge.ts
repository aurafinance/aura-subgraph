import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts'
import {
  Deposit,
  Transfer,
  UpdateLiquidityLimit,
  Withdraw,
  Gauge as GaugeContract,
} from '../../generated/templates/Gauge/Gauge'
import { Gauge } from '../../generated/schema'

export function getGauge(address: Address): Gauge {
  let id = address.toHex()
  let gauge = Gauge.load(id)

  if (gauge != null) {
    return gauge
  }

  gauge = new Gauge(id)
  gauge.balance = BigInt.zero()
  gauge.totalSupply = BigInt.zero()
  gauge.workingSupply = BigInt.zero()

  let context = dataSource.context()
  gauge.pool = context.getString('poolId')

  gauge.save()
  return gauge
}

function updateGauge(gauge: Gauge): void {
  let contract = GaugeContract.bind(Address.fromString(gauge.id))

  let auraProxy = Address.fromString(
    '0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2',
  )
  gauge.balance = contract.balanceOf(auraProxy)

  gauge.totalSupply = contract.totalSupply()
  gauge.workingSupply = contract.working_supply()

  gauge.save()
}

export function handleDeposit(event: Deposit): void {
  updateGauge(getGauge(event.address))
}

export function handleTransfer(event: Transfer): void {
  updateGauge(getGauge(event.address))
}

export function handleUpdateLiquidityLimit(event: UpdateLiquidityLimit): void {
  updateGauge(getGauge(event.address))
}

export function handleWithdraw(event: Withdraw): void {
  updateGauge(getGauge(event.address))
}
