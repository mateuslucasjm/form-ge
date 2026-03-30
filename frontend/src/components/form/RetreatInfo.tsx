import styles from "./RetreatInfo.module.css";

export const RetreatInfo = () => {
  return (
    <div className={styles.infoSection}>
      <p>
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>
          VALOR DO RETIRO:
        </strong>
        <br />
        1º LOTE: até 28/02/2026 – R$ 320,00
        <br />
        2º LOTE: 01/03/2026 até 31/05/2026 – R$ 350,00
        <br />
        <br />
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>
          FORMA DE PAGAMENTO:
        </strong>
        <br />
        PIX, boleto ou cartão
        <br />
        01/02 até 28/02 → até{" "}
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>4x</strong> no
        cartão
        <br />
        01/03 até 31/03 → até{" "}
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>3x</strong> no
        cartão
        <br />
        01/04 até 30/04 → até{" "}
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>2x</strong> no
        cartão
        <br />
        01/05 até 31/05 → até{" "}
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>1x</strong> no
        cartão
        <br />
        <br />
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>
          DATAS DO RETIRO:
        </strong>
        <br />
        Quinta – 04/06/2026
        <br />
        Sexta – 05/06/2026
        <br />
        Sábado – 06/06/2026
        <br />
        Domingo – 07/06/2026
        <br />
        <br />
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>
          INFORMAÇÕES:
        </strong>
        <br />
        Danth Duarte - (31) 9 9477-2140
        <br />
        <br />
        <strong style={{ color: "#22669A", fontWeight: "bold" }}>
          GRUPO DO GE (WHATSAPP):
        </strong>
        <br />
        <a href="https://chat.whatsapp.com/Kpd1H7HBGtbIahIlC9B4RT?mode=gi_t">
          Clique aqui
        </a>
        <br />
      </p>
    </div>
  );
};
