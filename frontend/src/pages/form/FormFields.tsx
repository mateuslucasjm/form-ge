import {
  AutocompleteInput,
  CustomButton,
  InputField,
  NumberSelectField,
  SelectField,
} from "@/components/form";
import { formatCPF, formatPhone } from "@/utils/formUtils";
import type { FormData } from "@/contexts/FormContext";
import type { FormEvent } from "react";

import styles from "./Form.module.css";

type MunicipioOption = { id: number; nome: string; estado: string; label: string };

type FormFieldsProps = {
  form: FormData;
  municipios: MunicipioOption[];
  sexOptions: string[];
  maritalStatusOptions: string[];
  lodgingOptions: string[];
  billingTypeOptions: string[];
  maxInstallments: number;
  installmentCountOptions: number[];
  isSubmitting: boolean;
  onChange: (name: string, value: string | number | null) => void;
  onSubmit: (e: FormEvent) => void | Promise<void>;
};

export function FormFields({
  form,
  municipios,
  sexOptions,
  maritalStatusOptions,
  lodgingOptions,
  billingTypeOptions,
  maxInstallments,
  installmentCountOptions,
  isSubmitting,
  onChange,
  onSubmit,
}: FormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className={styles.formCard} aria-label="Formulário">
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Formulário de Inscrição</h2>
        <p className={styles.formSubtitle}>
          Preencha seus dados para confirmar sua inscrição.
        </p>
      </div>

      <div className={styles.fields}>
        <InputField label="Nome" name="name" value={form.name} onChange={onChange} />

        <InputField
          label="Sobrenome"
          name="lastName"
          value={form.lastName}
          onChange={onChange}
        />

        <InputField
          label="E-mail"
          name="email"
          value={form.email}
          onChange={onChange}
        />

        <InputField
          label="CPF"
          name="cpf"
          value={form.cpf}
          onChange={(name, value) =>
            typeof value === "string" ? onChange(name, formatCPF(value)) : onChange(name, value)
          }
          type="tel"
          inputMode="numeric"
        />

        <SelectField
          label="Sexo"
          name="sex"
          value={form.sex}
          options={sexOptions}
          onChange={(name, value) => onChange(name, value)}
        />

        <SelectField
          label="Estado Civil"
          name="maritalStatus"
          value={form.maritalStatus}
          options={maritalStatusOptions}
          onChange={(name, value) => onChange(name, value)}
        />

        <AutocompleteInput
          label="Cidade"
          name="city"
          value={form.city || ""}
          onChange={(name, val) => onChange(name, val)}
          options={municipios}
        />

        <InputField
          label="Idade"
          name="age"
          type="number"
          value={form.age}
          onChange={(name, value) => onChange(name, value)}
          maxLength={2}
        />

        <InputField
          label="Telefone"
          name="phone"
          value={form.phone}
          onChange={(name, value) =>
            typeof value === "string"
              ? onChange(name, formatPhone(value))
              : onChange(name, value)
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
          onChange={(name, value) => onChange(name, value)}
        />

        <SelectField
          label="Forma de Pagamento"
          name="billingType"
          value={form.billingType}
          options={billingTypeOptions}
          onChange={(name, value) => onChange(name, value)}
        />

        {form.billingType === "CREDIT_CARD" && (
          <NumberSelectField
            label={`Número de Parcelas (até ${maxInstallments}x)`}
            name="installmentCount"
            value={form.installmentCount}
            options={installmentCountOptions}
            onChange={(name, value) => onChange(name, value)}
          />
        )}
      </div>

      <div className={styles.actions}>
        <CustomButton type="submit" isSubmitting={isSubmitting} fullWidth>
          Enviar
        </CustomButton>
      </div>
    </form>
  );
}

