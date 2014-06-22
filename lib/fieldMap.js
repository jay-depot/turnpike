/**
 * fieldMap().
 * Generates a one-to-one mapping function of field names from an object.
 */

var _ = require('underscore');

function fieldMap(map) {
  var reverseMap = _(map).invert();

  /*
   * Generated field map function
   * returns the value of map[field] if defined. Otherwise returns field.
   * If reverse is true, returns the key in map which has value field.
   */
  return function(field, reverse) {
    var target = field;
    if (reverse) {
      if (reverseMap.hasOwnProperty(field))  {
        target = reverseMap[field];
      }
    }
    else {
      if (map.hasOwnProperty(field))  {
        target = map[field];
      }
    }

    return target;
  }
}

module.exports = fieldMap;
