import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

export default function Segnalazione() {
  const { token, user } = useAuth(); // 👈 recupero user con ruolo e cliente_id
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categorie, setCategorie] = useState<any[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [clienti, setClienti] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState(""); // 👈 per admin
  const toast = useToast();

  // Carica categorie e (solo se admin) clienti
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setCategorie);

    if (user?.ruolo === "admin") {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setClienti);
    }
  }, [token, user]);

  const handleSubmit = async () => {
    try {
      const payload: any = {
        data,
        ora,
        descrizione,
        categoria_id: categoriaId,
      };

      // 👉 Solo admin passa clienteId manualmente
      if (user?.ruolo === "admin") {
        payload.cliente_id = clienteId;
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Errore nel salvataggio");

      toast({ title: "Segnalazione inserita", status: "success" });

      // reset form
      setData("");
      setOra("");
      setDescrizione("");
      setCategoriaId("");
      setClienteId("");
    } catch (err) {
      toast({ title: "Errore nel salvataggio", status: "error" });
    }
  };

  return (
    <Flex direction="column" p={6} bg="gray.50" minH="100vh">
      <Heading mb={6}>Nuova Segnalazione</Heading>
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          mb={3}
        />
        <Input
          type="time"
          value={ora}
          onChange={(e) => setOra(e.target.value)}
          mb={3}
        />
        <Select
          placeholder="Seleziona categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          mb={3}
        >
          {categorie.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome_categoria}
            </option>
          ))}
        </Select>

        {/* 👇 Campo visibile solo agli admin */}
        {user?.ruolo === "admin" && (
          <Select
            placeholder="Seleziona cliente"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            mb={3}
          >
            {clienti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_sala}
              </option>
            ))}
          </Select>
        )}

        <Textarea
          placeholder="Descrizione"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          mb={3}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          Invia Segnalazione
        </Button>
      </Box>
    </Flex>
  );
}
