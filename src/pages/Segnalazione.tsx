import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Select,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria?: string;
  sala?: string;
};

type Categoria = { id: number; nome_categoria: string };

export default function Segnalazione() {
  const { token, user } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [formData, setFormData] = useState({
    data: "",
    ora: "",
    descrizione: "",
    categoria_id: "",
  });
  const toast = useToast();

  // Carica dati
  const loadData = async () => {
    try {
      const [segRes, catRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSegnalazioni(await segRes.json());
      setCategorie(await catRes.json());
    } catch {
      toast({ title: "Errore caricamento dati", status: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Invia nuova segnalazione
  const handleSubmit = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Errore inserimento");

      toast({ title: "Segnalazione inserita", status: "success" });
      setFormData({ data: "", ora: "", descrizione: "", categoria_id: "" });
      loadData();
    } catch {
      toast({ title: "Errore nel salvataggio", status: "error" });
    }
  };

  // Filtri
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    return dataMatch && catMatch;
  });

  // Export CSV
  const esportaCSV = () => {
    const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione"];
    const rows = segnalazioniFiltrate.map((s) => [
      s.id,
      new Date(s.data).toLocaleDateString("it-IT"),
      s.ora,
      s.categoria || "",
      s.sala || "",
      s.descrizione || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(";")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "segnalazioni.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const esportaPDF = () => {
    const printContent = `
      <h2>Segnalazioni</h2>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead>
          <tr>
            <th>ID</th><th>Data</th><th>Ora</th>
            <th>Categoria</th><th>Sala</th><th>Descrizione</th>
          </tr>
        </thead>
        <tbody>
          ${segnalazioniFiltrate
            .map(
              (s) => `
            <tr>
              <td>${s.id}</td>
              <td>${new Date(s.data).toLocaleDateString("it-IT")}</td>
              <td>${s.ora}</td>
              <td>${s.categoria || ""}</td>
              <td>${s.sala || ""}</td>
              <td>${s.descrizione || ""}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
    const newWin = window.open("", "_blank");
    newWin!.document.write(printContent);
    newWin!.print();
    newWin!.close();
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      <Heading mb={6}>📋 Nuova Segnalazione</Heading>

      {/* Form nuova segnalazione */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
        <HStack spacing={4} mb={4}>
          <Input
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
          />
          <Input
            type="time"
            value={formData.ora}
            onChange={(e) => setFormData({ ...formData, ora: e.target.value })}
          />
          <Select
            placeholder="Seleziona categoria"
            value={formData.categoria_id}
            onChange={(e) =>
              setFormData({ ...formData, categoria_id: e.target.value })
            }
          >
            {categorie.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </Select>
        </HStack>
        <Textarea
          placeholder="Descrizione"
          value={formData.descrizione}
          onChange={(e) =>
            setFormData({ ...formData, descrizione: e.target.value })
          }
          mb={4}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          Invia Segnalazione
        </Button>
      </Box>

      {/* Filtri */}
      <HStack mb={4} spacing={4}>
        <Input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
        <Select
          placeholder="Tutte le categorie"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          {categorie.map((c) => (
            <option key={c.id} value={c.nome_categoria}>
              {c.nome_categoria}
            </option>
          ))}
        </Select>
        <Button onClick={() => { setFiltroData(""); setFiltroCategoria(""); }}>
          Reset Filtri
        </Button>
      </HStack>

      {/* Tabella segnalazioni */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Data</Th>
              <Th>Ora</Th>
              <Th>Categoria</Th>
              <Th>Sala</Th>
              <Th>Descrizione</Th>
            </Tr>
          </Thead>
          <Tbody>
            {segnalazioniFiltrate.map((s) => (
              <Tr key={s.id}>
                <Td>{s.id}</Td>
                <Td>{new Date(s.data).toLocaleDateString("it-IT")}</Td>
                <Td>{s.ora}</Td>
                <Td>{s.categoria}</Td>
                <Td>{s.sala}</Td>
                <Td>{s.descrizione}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Bottoni export */}
      <HStack spacing={6} justify="center" mt={4}>
        <Button colorScheme="green" onClick={esportaCSV}>
          ⬇️ Esporta CSV
        </Button>
        <Button colorScheme="blue" onClick={esportaPDF}>
          ⬇️ Esporta PDF
        </Button>
      </HStack>
    </Flex>
  );
}
