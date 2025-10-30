export default function OrcamentoPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "32px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "210mm",
          height: "297mm",
          backgroundColor: "white",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "64px 48px 0 48px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <p style={{ color: "#2563eb", fontWeight: "600", fontSize: "16px" }}>Data: 21/08/2030</p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0", marginRight: "64px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", lineHeight: "1" }}>
                    <span style={{ color: "#16a34a" }}>Orça</span>
                    <span style={{ color: "#2563eb" }}>norte</span>
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "48px",
                    width: "40px",
                    height: "100px",
                    backgroundColor: "#1e3a8a",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ width: "55%", height: "24px", backgroundColor: "#1e3a8a" }} />
            <div
              style={{
                flex: "1",
                display: "flex",
                justifyContent: "flex-start",
                paddingLeft: "16px",
                paddingRight: "48px",
              }}
            >
              <h1
                style={{
                  color: "#2563eb",
                  fontSize: "22px",
                  fontWeight: "normal",
                  fontFamily: "sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                ORÇAMENTO #01234
              </h1>
            </div>
          </div>

          <div style={{ padding: "0 48px", flex: "1", display: "flex", flexDirection: "column" }}>
            {/* Seção A/C */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ color: "#2563eb", fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>A/C:</h3>
              <p style={{ fontWeight: "bold", color: "black", fontSize: "16px", marginBottom: "2px" }}>
                Mateus Silveira
              </p>
              <p style={{ color: "black", fontSize: "16px", marginBottom: "2px" }}>(12) 3456-7890</p>
              <p style={{ color: "black", fontSize: "16px" }}>Rua Alegre, 123 - Cidade Brasileira</p>
            </div>

            {/* Área para tabela de serviços */}
            <div style={{ flex: "1" }}></div>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "64px" }}>
              <div
                style={{
                  backgroundColor: "#1e3a8a",
                  color: "white",
                  padding: "10px 40px",
                  fontWeight: "bold",
                  fontSize: "20px",
                  letterSpacing: "0.05em",
                }}
              >
                TOTAL: R$ 7.900,00
              </div>
            </div>

            {/* Linha separadora */}
            <div style={{ width: "128px", height: "3px", backgroundColor: "#1e3a8a", marginBottom: "16px" }} />

            {/* Forma de pagamento e termos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", marginBottom: "32px" }}>
              <div>
                <h3 style={{ color: "#2563eb", fontWeight: "bold", fontSize: "16px", marginBottom: "6px" }}>
                  FORMA DE PAGAMENTO
                </h3>
                <p style={{ fontSize: "14px", color: "black", lineHeight: "1.625" }}>Pix com 10% de desconto</p>
                <p style={{ fontSize: "14px", color: "black", lineHeight: "1.625" }}>ou 2x no cartão de crédito</p>
              </div>
              <div>
                <h3 style={{ color: "#2563eb", fontWeight: "bold", fontSize: "16px", marginBottom: "6px" }}>
                  TERMOS E CONDIÇÕES
                </h3>
                <p style={{ fontSize: "14px", color: "black", lineHeight: "1.625" }}>
                  Este orçamento é válido por 30 dias.
                </p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#1e3a8a", color: "white", padding: "12px 48px", marginBottom: "88px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📱</span>
                  <span>(66) 9 9661-4628</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>✉️</span>
                  <span>orcanorte28@gmail.com</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🌐</span>
                  <span>www.orcanorte.com.br</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📷</span>
                  <span>@orcanorte</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
