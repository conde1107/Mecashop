// src/components/PaypalButton.jsx
import React, { useEffect, useRef } from "react";

const PaypalButton = ({ total, onSuccess }) => {
  const paypalRef = useRef();

  useEffect(() => {
    // Renderizar botón solo si window.paypal existe
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: total.toFixed(2), // Total a pagar
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          console.log("Pago aprobado:", order);
          onSuccess(order);
        },
        onError: (err) => {
          console.error("Error con PayPal:", err);
          alert("Ocurrió un error al procesar el pago");
        },
      }).render(paypalRef.current);
    }
  }, [total, onSuccess]);

  return <div ref={paypalRef}></div>;
};

export default PaypalButton;
