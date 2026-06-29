import { useEffect, useState } from 'react'

import {

  getOutstandingPaymentBreakdown,

  getTotalPaymentOwed,

  getTotalRemitsReceived,

  subscribePaymentOwed,

  type AsgPaymentDueBreakdown,

} from '../lib/asgRemitPayments'



export function useAsgPaymentOwed() {

  const [breakdown, setBreakdown] = useState<AsgPaymentDueBreakdown[]>(() =>

    getOutstandingPaymentBreakdown(),

  )

  const [paymentOwed, setPaymentOwed] = useState(() => getTotalPaymentOwed())

  const [remitsReceived, setRemitsReceived] = useState(() => getTotalRemitsReceived())



  useEffect(() => {

    function refresh() {

      setBreakdown(getOutstandingPaymentBreakdown())

      setPaymentOwed(getTotalPaymentOwed())

      setRemitsReceived(getTotalRemitsReceived())

    }

    return subscribePaymentOwed(refresh)

  }, [])



  return {

    breakdown,

    paymentOwed,

    remitsReceived,

    total: paymentOwed,

    hasBalance: paymentOwed > 0,

    items: breakdown,

  }

}


