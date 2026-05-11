import {
  AutocompleteInput,
  CustomButton,
  FormHeader,
  InputField,
  LoadingOverlay,
  NumberSelectField,
  RetreatInfo,
  SelectField,
  SnackbarMessage,
} from "@/components/form";

import {
  asaas,
  emailService,
  getAllMunicipios,
  getServerTime,
} from "@/services";

import { useFormContext } from "@/contexts/FormContext";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { formatCPF, formatPhone } from "@/utils/formUtils";
import { type FormEvent, useEffect, useState } from "react";

import styles from "./Form.module.css";

function Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverDate, setServerDate] = useState<Date | null>(null);
  const { sendData } = useGoogleSheets();
  const { form, setForm } = useFormContext();

  const sexOptions = ["Masculino", "Feminino"];
  const maritalStatusOptions = ["Solteiro", "Casado"];
  const isPonteNova = form.city === "Ponte Nova - MG";

  const lodgingOptions = isPonteNova
    ? ["Barraca", "Casa própria"]
    : ["Barraca", "Casa própria", "Alojamento"];
  const billingTypeOptions = ["UNDEFINED", "BOLETO", "PIX"];

  const [municipios, setMunicipios] = useState<
    { id: number; nome: string; estado: string; label: string }[]
  >([]);

  useEffect(() => {
    async function fetchMunicipios() {
      const data = await getAllMunicipios();
      setMunicipios(data);
    }
    fetchMunicipios();
  }, []);

  useEffect(() => {
    if (form.city === "Ponte Nova" && form.lodging === "Alojamento") {
      setForm({ lodging: undefined });
    }
  }, [form.city, form.lodging, setForm]);

  const monthInstallmentsMap: Record<number, number> = {
    12: 5,
    1: 5,
    2: 4,
    3: 3,
    4: 2,
    5: 1,
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"info" | "error">(
    "info",
  );

  useEffect(() => {
    async function fetchServerTime() {
      const date = await getServerTime();
      setServerDate(date);
    }
    fetchServerTime();
  }, []);

  const getValorPromocional = (data: Date) => {
    const primeiroLoteFim = new Date("2026-02-28T23:59:59");
    const segundoLoteFim = new Date("2026-05-31T23:59:59");

    if (data <= primeiroLoteFim) return 320;
    if (data <= segundoLoteFim) return 350;
    return 350;
  };

  const valorAtual = serverDate ? getValorPromocional(serverDate) : 0;
  const dueDate =
    serverDate?.toISOString().split("T")[0] ||
    new Date().toISOString().split("T")[0];

  const currentMonth = serverDate
    ? serverDate.getMonth() + 1
    : new Date().getMonth() + 1;
  const maxInstallments = monthInstallmentsMap[currentMonth] || 1;
  const installmentCountOptions = Array.from(
    { length: maxInstallments },
    (_, i) => i + 1,
  );

  const handleChange = (name: string, value: string | number | null) => {
    setForm({ [name]: value });

    if (name === "billingType" && value !== "CREDIT_CARD") {
      setForm({ installmentCount: null });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serverDate || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!form.name || !form.cpf || !form.email) {
        setSnackbarMessage("Preencha nome, CPF e e-mail corretamente.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setIsSubmitting(false);
        return;
      }

      if (!form.age || Number(form.age) < 15) {
        setSnackbarMessage(
          "É permitido apenas inscrições a partir de 15 anos.",
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setIsSubmitting(false);
        return;
      }

      const cidadeValida = municipios.some((m) => m.label === form.city);

      if (!cidadeValida) {
        setSnackbarMessage("Selecione uma cidade válida da lista.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // 1. Criar cliente
      const customerResponse = await asaas.createClient(
        form.name,
        form.cpf,
        form.email,
        form.notificationDisabled,
        form.groupName,
      );

      const customer = customerResponse.id;

      const installmentCount =
        form.billingType === "CREDIT_CARD" ? form.installmentCount! : null;

      const paymentPayload =
        form.billingType === "CREDIT_CARD"
          ? { totalValue: valorAtual, installmentCount }
          : { value: valorAtual };

      // 2. Criar pagamento
      const lastPayment = await asaas.createPayment(
        customer,
        form.billingType,
        dueDate,
        paymentPayload.installmentCount ?? null,
        paymentPayload.totalValue ?? paymentPayload.value,
      );

      if (!lastPayment || !lastPayment.invoiceUrl) {
        throw new Error("Não foi possível gerar a cobrança.");
      }

      // 3. Enviar e-mail
      await emailService.sendInvoiceEmail(
        form.name,
        form.email,
        lastPayment.invoiceUrl,
      );

      // 4. Buscar TODOS os pagamentos do cliente
      const allPayments = await asaas.listPayments(customer);

      // 5. Montar payload COMPLETO (resumo + pagamentos)
      const payload = {
        resumo: {
          ...form,
          customer,
          paymentId: lastPayment.id,
          invoiceUrl: lastPayment.invoiceUrl,
          status: lastPayment.status,
          valor: valorAtual,
        },

        pagamentos: allPayments.map((p: any) => ({
          customer,
          paymentId: p.id,
          name: form.name,
          lastName: form.lastName,
          description: p.description,
          invoiceUrl: p.invoiceUrl,
          status: p.status,
          valor: p.value ?? valorAtual,
          billingType: p.billingType,
          dueDate: p.dueDate,
        })),
      };

      // 6. Enviar para o Google Sheets
      await sendData(payload);

      // 7. Atualizar contexto
      setForm({
        ...form,
        customer,
        paymentId: lastPayment.id,
        invoiceUrl: lastPayment.invoiceUrl,
        status: lastPayment.status,
      });

      setSnackbarMessage("Formulário enviado com sucesso!");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);

      // 8. Redirecionar para pagamento
      window.location.href = lastPayment.invoiceUrl;
    } catch (err: any) {
      console.error("Erro no envio:", err);
      setSnackbarMessage(
        err.response?.data?.message ||
          err.message ||
          "Erro ao enviar formulário",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <LoadingOverlay isOpen={isSubmitting} />

      <div className={styles.formWrapper}>
        {/* COLUNA ESQUERDA */}
        <div className={styles.leftColumn}>
          <FormHeader
            imageSrc="/ge-image.jpeg"
            title="Retiro Geração Eleita em Ponte Nova - 2026"
            subtitle={
              <>
                <div>
                  <span style={{ color: "#22669A", fontWeight: "bold" }}>
                    Data:{" "}
                  </span>
                  04/06/2026 a 07/06/2026
                </div>
                <div>
                  <span style={{ color: "#22669A", fontWeight: "bold" }}>
                    Valor Atual:
                  </span>{" "}
                  R$
                  {valorAtual},00
                </div>
                <div>
                  <span style={{ color: "#22669A", fontWeight: "bold" }}>
                    Idade mínima:
                  </span>{" "}
                  15 anos
                </div>
              </>
            }
          />
          <RetreatInfo />
        </div>

        {/* COLUNA DIREITA */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "30px",
              color: "#22669A",
              fontWeight: "bold",
            }}
          >
            Formulário de Inscrição
          </h2>
          <InputField
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <InputField
            label="Sobrenome"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />

          <InputField
            label="E-mail"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <InputField
            label="CPF"
            name="cpf"
            value={form.cpf}
            onChange={(name, value) =>
              typeof value === "string"
                ? handleChange(name, formatCPF(value))
                : handleChange(name, value)
            }
            type="tel"
            inputMode="numeric"
          />

          <SelectField
            label="Sexo"
            name="sex"
            value={form.sex}
            options={sexOptions}
            onChange={handleChange}
          />

          <SelectField
            label="Estado Civil"
            name="maritalStatus"
            value={form.maritalStatus}
            options={maritalStatusOptions}
            onChange={handleChange}
          />

          <AutocompleteInput
            label="Cidade"
            name="city"
            value={form.city || ""}
            onChange={(name, val) => handleChange(name, val)}
            options={municipios}
          />

          <InputField
            label="Idade"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            maxLength={2}
          />

          <InputField
            label="Telefone"
            name="phone"
            value={form.phone}
            onChange={(name, value) =>
              typeof value === "string"
                ? handleChange(name, formatPhone(value))
                : handleChange(name, value)
            }
            type="tel"
            inputMode="numeric"
            maxLength={15}
          />

          <SelectField
            label="Alojamento"
            name="lodging"
            value={form.lodging}
            options={lodgingOptions}
            onChange={handleChange}
          />

          <SelectField
            label="Forma de Pagamento"
            name="billingType"
            value={form.billingType}
            options={billingTypeOptions}
            onChange={handleChange}
          />

          {form.billingType === "CREDIT_CARD" && (
            <NumberSelectField
              label={`Número de Parcelas (até ${maxInstallments}x)`}
              name="installmentCount"
              value={form.installmentCount}
              options={installmentCountOptions}
              onChange={handleChange}
            />
          )}

          <div className={styles.actions}>
            <CustomButton type="submit" isSubmitting={isSubmitting} fullWidth>
              Enviar
            </CustomButton>
          </div>
        </form>

        <SnackbarMessage
          open={snackbarOpen}
          message={snackbarMessage}
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
        />
      </div>
    </div>
  );
}

export default Form;
