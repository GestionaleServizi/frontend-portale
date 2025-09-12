import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
} from "@chakra-ui/react";
import axios from "axios";

export default function Segnalazione() {
  const [formData, setFormData] = useState({
    data: "",
    ora: "",
    descrizione: "",
    cliente_id: "",
    categoria_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, ora, descrizione, cliente_id, categoria_id } = formData;

      // ✅ Controllo campi obbligatori
      if (!data || !ora || !descrizione || !cliente_id || !categoria_id) {
        alert("Tutti i campi sono obbligatori!");
        return;
      }

      // ✅ Invio dati al backend
      const res = await axios.post("/api/segnalazioni", {
        data,
        ora,
        descrizione,
        cliente_id,
        categoria_id,
      });

      console.log("Risposta backend:", res.data);
      alert("Segnalazione inviata con successo!");
    } catch (error) {
      console.error("Errore invio segnalazione:", error);
      alert("Errore nell'invio della segnalazione");
    }
  };

  return (
    <Box p={6}>
      <form onSubmit={handleSubmit}>
        <FormControl mb={3}>
          <FormLabel>Data</FormLabel>
          <Input type="date" name="data" value={formData.data} onChange={handleChange} />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Ora</FormLabel>
          <Input type="time" name="ora" value={formData.ora} onChange={handleChange} />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Descrizione</FormLabel>
          <Textarea name="descrizione" value={formData.descrizione} onChange={handleChange} />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Cliente</FormLabel>
          <Select name="cliente_id" value={formData.cliente_id} onChange={handleChange}>
            <option value="">Seleziona cliente</option>
            <option value="1">Cliente 1</option>
            <option value="2">Cliente 2</option>
          </Select>
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Categoria</FormLabel>
          <Select name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
            <option value="">Seleziona categoria</option>
            <option value="1">Categoria 1</option>
            <option value="2">Categoria 2</option>
          </Select>
        </FormControl>

        <Button type="submit" colorScheme="blue">
          Invia Segnalazione
        </Button>
      </form>
    </Box>
  );
}
