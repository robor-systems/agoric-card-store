// @ts-check
import { AssetKind } from '@agoric/ertp';
import {
  stringifyValue as formatValue,
  parseAsValue,
} from '@agoric/ui-components';

/**
 * @typedef {{ assetKind?: AssetKind } & DisplayInfo} AmountDisplayInfo
 */

/**
 *
 * @param {string} value
 * @param {AmountDisplayInfo} [displayInfo]
 * @returns {Value}
 */
export function makeValue(value, displayInfo) {
  const { assetKind = AssetKind.NAT, decimalPlaces = 0 } = displayInfo || {};
  return parseAsValue(value, assetKind, decimalPlaces);
}
/**
 *
 * @param {any} value
 * @param {AmountDisplayInfo} [displayInfo]
 * @param {boolean} [noDecimal]
 * @returns {string}
 * This is borrowed from wallet ui
 */
export function stringifyValue(value, displayInfo, noDecimal) {
  const { assetKind = AssetKind.NAT, decimalPlaces = 0 } = displayInfo || {};
  const show = noDecimal ? 0 : decimalPlaces;
  return formatValue(value, assetKind, decimalPlaces, show);
}

export function stringifyValueRUN(value, displayInfo) {
  const { assetKind = AssetKind.NAT } = displayInfo || {};
  const val = formatValue(value, assetKind, 6, 0);
  return val.toString().concat(' RUN');
}
