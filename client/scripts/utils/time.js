import moment from 'moment'

export function sortTimestamp(attribute, elements) {
  return elements.sort((a, b) => {
    if (!a.hasOwnProperty(attribute)) return -1
    else if (!b.hasOwnProperty(attribute)) return 1

    if (a[attribute] instanceof Date) {
      if (a[attribute] > b[attribute]) return 1
      else if (a[attribute] < b[attribute]) return -1;
    } else if (moment.isMoment(a[attribute])) {
      if (a[attribute].isAfter(b[attribute])) return 1
      else if (a[attribute].isBefore(b[attribute])) return -1
    }
    return 0
  })
}

export function convertTimestamps(attributes, elements) {
  if (!Array.isArray(elements)) elements = [elements]
  return elements.map(element => {
    let newElement = {}
    attributes.forEach(attribute => {
      if (element.hasOwnProperty(attribute)) newElement[attribute] = moment(element[attribute])
    })
    return Object.assign({}, element, newElement)
  })
}
