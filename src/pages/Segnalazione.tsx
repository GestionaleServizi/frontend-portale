import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  Select,
  Textarea,
  Button,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

type Categoria = { id: number; nome_categoria: string };
type Cliente = { id: number; nome_sala: string };

export default function Segnalazione() {
  const { token } = useAuth();
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const toast = useToast();

  // 🔹 Carica categorie e clienti
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, cliRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCategorie(await catRes.json());
        setClienti(await cliRes.json());
      } catch {
        toast({ title: "Errore caricamento dati", status: "error" });
      }
    };
    fetchData();
  }, [token]);

  // 🔹 Invia segnalazione
  const handleSubmit = async () => {
    if (!data || !ora || !descrizione || !categoriaId || !clienteId) {
      toast({ title: "Compila tutti i campi", status: "warning" });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data,
          ora,
          descrizione,
          categoria_id: categoriaId,
          cliente_id: clienteId,
        }),
      });

      if (!res.ok) throw new Error("Errore inserimento segnalazione");

      toast({ title: "Segnalazione inviata", status: "success" });

      // reset campi
      setData("");
      setOra("");
      setDescrizione("");
      setCategoriaId("");
      setClienteId("");
    } catch {
      toast({ title: "Errore invio segnalazione", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="lg" shadow="md" w="full" maxW="md">
        <Heading size="lg" mb={6} textAlign="center">
          📝 Nuova Segnalazione
        </Heading>
        <VStack spacing={4}>
          <Input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <Input
            type="time"
            value={ora}
            onChange={(e) => setOra(e.target.value)}
          />
          <Select
            placeholder="Seleziona categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            {categorie.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Seleziona cliente/sala"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            {clienti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_sala}
              </option>
            ))}
          </Select>
          <Textarea
            placeholder="Descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
          />
          <Button colorScheme="blue" w="full" onClick={handleSubmit}>
            Invia Segnalazione
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
