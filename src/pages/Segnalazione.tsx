import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

type Categoria = { id: number; nome_categoria: string };
type Cliente = { id: number; nome_sala: string };

export default function Segnalazione() {
  const { token, user } = useAuth();
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cliente, setCliente] = useState("");
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const toast = useToast();

  // Carica categorie e clienti (solo admin ha bisogno dei clienti)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategorie(await catRes.json());

        if (user?.ruolo === "admin") {
          const cliRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setClienti(await cliRes.json());
        }
      } catch {
        toast({ title: "Errore caricamento dati", status: "error" });
      }
    };
    fetchData();
  }, [token, user, toast]);

  const handleSubmit = async () => {
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
          categoria_id: categoria,
          // 👉 Admin passa cliente_id, operatore no
          cliente_id: user?.ruolo === "admin" ? cliente : undefined,
        }),
      });

      if (!res.ok) throw new Error("Errore salvataggio");

      toast({ title: "Segnalazione salvata", status: "success" });
      setData("");
      setOra("");
      setDescrizione("");
      setCategoria("");
      setCliente("");
    } catch {
      toast({ title: "Errore nel salvataggio", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={8}>
      <Box bg="white" p={8} rounded="md" shadow="md" w="100%" maxW="600px">
        <Heading size="lg" mb={6}>
          📝 Nuova Segnalazione
        </Heading>

        <FormControl mb={4} isRequired>
          <FormLabel>Data</FormLabel>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel>Ora</FormLabel>
          <Input type="time" value={ora} onChange={(e) => setOra(e.target.value)} />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel>Categoria</FormLabel>
          <Select
            placeholder="Seleziona categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categorie.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* 👇 Campo Cliente visibile solo agli admin */}
        {user?.ruolo === "admin" && (
          <FormControl mb={4} isRequired>
            <FormLabel>Cliente</FormLabel>
            <Select
              placeholder="Seleziona cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            >
              {clienti.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_sala}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl mb={4} isRequired>
          <FormLabel>Descrizione</FormLabel>
          <Textarea
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
          />
        </FormControl>

        <Button colorScheme="blue" onClick={handleSubmit}>
          Invia Segnalazione
        </Button>
      </Box>
    </Flex>
  );
}
