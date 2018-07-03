import SpecialAddresses from '@/services/SpecialAddresses'

export default {

  formatMoneyNumber(n, decimals=0) {

    var number = parseInt(n / 10000);
    var decimalNumber = this.getNumberRest(n);

    if (decimals === 0) return this.formatIntNumber(number);
    else return this.formatIntNumber(number) + '.' + this.getFirstDigits(decimalNumber, decimals);

  },

  formatIntNumber(number) {

    return number.toString().replace(/./g, function (c, i, a) {
      return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });

  },

  getNumberRest(number) {

    return number % 10000;

  },

  getFirstDigits(number, decimals) {

    var decimalsVerifier = Math.pow(10, decimals);
    var newNumber = '';

    if (number < 10) {

      newNumber = '000' + number.toString();

    } else if (number < 100) {

      newNumber = '00' + number.toString();

    } else if (number < 1000) {

      newNumber = '0' + number.toString();

    } else if (number < 10000) {

      newNumber = '' + number.toString();

    }

    return newNumber.substring(0, decimals);

  },

  mapAddress(address) {
    let label = address
    SpecialAddresses.pools.forEach(function (pool) {
      if (pool.address == address) {
        label = pool.name
        return
      }
    })
    return label
  }

}
