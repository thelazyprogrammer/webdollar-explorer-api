import SpecialAddresses from '@/services/SpecialAddresses'

export default {

  formatMoneyNumber (n, decimals = 0) {
    if (!n || isNaN(n)) {
      n = 0
    }
    var number = parseInt(n / 10000)
    var decimalNumber = this.getNumberRest(n)
    var sign = ''
    if (number < 0) {
      sign = '-'
      number = -number
    }
    var result = ''
    if (decimals === 0) {
      result = this.formatIntNumber(number)
    } else {
      result = this.formatIntNumber(number) + '.' + this.getFirstDigits(decimalNumber, decimals)
    }
    let splitDecimals = result.split('.')
    if (splitDecimals[1]) {
      let afterDecimals = parseFloat('0.' + splitDecimals[1]).toString()
      result = splitDecimals[0]
      if (afterDecimals !== '0') {
        result += afterDecimals.replace('0.', '.')
      }
    }
    return sign + result
  },

  formatIntNumber (number) {
    return number.toString().replace(/./g, function (c, i, a) {
      return i && c !== '.' && ((a.length - i) % 3 === 0) ? ',' + c : c
    })
  },

  getNumberRest (number) {
    return number % 10000
  },

  getFirstDigits (number, decimals) {
    var newNumber = ''

    if (number < 10) {
      newNumber = '000' + number.toString()
    } else if (number < 100) {
      newNumber = '00' + number.toString()
    } else if (number < 1000) {
      newNumber = '0' + number.toString()
    } else if (number < 10000) {
      newNumber = '' + number.toString()
    }

    return newNumber.substring(0, decimals)
  },

  mapAddress (address) {
    let label = address
    let specialAddresses = SpecialAddresses.pools.concat(SpecialAddresses.custom)
      .concat(SpecialAddresses.genesis_addresses)
    specialAddresses.forEach(function (specialAddress) {
      if (specialAddress.address === address && specialAddress.name) {
        label = specialAddress.name
      }
    })
    return label
  },

  setDisplay (el, type) {
    if (document.getElementById(el)) {
      document.getElementById(el).style.display = type
    }
  },

  setColor (el, color) {
    if (document.getElementById(el)) {
      document.getElementById(el).style.backgroundColor = color
    }
  },

  formatPower (number) {
    number = Number(number)
    if (isNaN(number)) { number = 0 }
    if (number > 1000000) {
      return (Math.round(number / 100000)) / 100 + ' Mh/s'
    }
    if (number > 1000) {
      return (Math.round(number / 10) / 100) + ' Kh/s'
    }
    return number + ' h/s'
  },

  getChartOptions () {
    return {
      chart: {
        backgroundColor: '#292828',
        zoomType: 'x'
      },
      title: {
        style: { 'color': '#fec02c' },
        text: null
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: null
        },
        type: 'logarithmic'
      },
      plotOptions: {
        area: {
          marker: {
            radius: 2
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        }
      },
      credits: {
        enabled: false
      },
      legend: {
        itemStyle: {
          color: '#fec02c',
          fontWeight: 'normal'
        }
      },
      series: [
        {
          name: 'Amount received',
          type: 'spline',
          data: [],
          color: '#576dd7'
        },
        {
          name: 'Amount sent',
          type: 'spline',
          data: [],
          color: '#da6654'
        },
        {
          name: 'Blocks mined',
          type: 'spline',
          data: [],
          color: '#00c02c'
        },
        {
          name: 'Transactions',
          type: 'spline',
          data: [],
          color: '#fec02c'
        }
      ]
    }
  }
}
