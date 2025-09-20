// src/pages/UtentiPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Flex,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Image,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

type Utente = {
  id: number;
  email: string;
  ruolo: "admin" | "operatore";
  cliente_id?: number | null;
  created_at?: string;
};

type Cliente = {
  id: number;
  nome_sala: string;
};

export default function UtentiPage() {
  const { token, logout } = useAuth();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Utente | null>(null);
  const [email, setEmail] = useState("");
  const [ruolo, setRuolo] = useState<"admin" | "operatore">("operatore");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  // Aggiungi stati per i filtri
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroRuolo, setFiltroRuolo] = useState("");

  // Carica utenti e clienti
  const loadUtenti = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUtenti(data);
    } catch {
      toast({ title: "Errore caricamento utenti", status: "error" });
    }
  };

  const loadClienti = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClienti(data);
    } catch {
      toast({ title: "Errore caricamento clienti", status: "error" });
    }
  };

  useEffect(() => {
    loadUtenti();
    loadClienti();
  }, []);

  // Filtra gli utenti in base ai criteri
  const utentiFiltrati = utenti.filter((utente) => {
    const emailMatch = filtroEmail 
      ? utente.email.toLowerCase().includes(filtroEmail.toLowerCase())
      : true;
    
    const ruoloMatch = filtroRuolo 
      ? utente.ruolo === filtroRuolo
      : true;
    
    return emailMatch && ruoloMatch;
  });

  const handleSave = async () => {
    try {
      // Validazione
      if (!email) {
        toast({ title: "Email obbligatoria", status: "warning" });
        return;
      }

      if (ruolo === "operatore" && !clienteId) {
        toast({ title: "Cliente obbligatorio per operatore", status: "warning" });
        return;
      }

      if (!selected && !password) {
        toast({ title: "Password obbligatoria per nuovo utente", status: "warning" });
        return;
      }

      const method = selected ? "PUT" : "POST";
      const url = selected
        ? `${import.meta.env.VITE_API_BASE_URL}/utenti/${selected.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/utenti`;

      // ✅ CORRETTO: Usa cliente_id come si aspetta il backend
      const dataToSend: any = {
        email,
        ruolo,
        cliente_id: clienteId  // ← QUESTO È IL CAMPO CORRETTO
      };

      // Aggiungi password solo se presente
      if (password) {
        dataToSend.password = password;
      }

      console.log("Dati inviati:", dataToSend); // Per debug

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      // ✅ Aggiungi debug della risposta
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Errore backend:", errorText);
        throw new Error(`Errore salvataggio: ${res.status} ${errorText}`);
      }

      const result = await res.json();
      console.log("Successo:", result);

      toast({
        title: selected ? "Utente aggiornato" : "Utente creato",
        status: "success",
      });
      
      // Reset form
      setEmail("");
      setRuolo("operatore");
      setClienteId(null);
      setPassword("");
      setSelected(null);
      
      onClose();
      loadUtenti();
    } catch (error: any) {
      console.error("Errore completo:", error);
      toast({ 
        title: "Errore salvataggio", 
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Vuoi davvero eliminare questo utente?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Utente eliminato", status: "info" });
      loadUtenti();
    } catch {
      toast({ title: "Errore eliminazione", status: "error" });
    }
  };

  const openModal = (utente?: Utente) => {
    if (utente) {
      setSelected(utente);
      setEmail(utente.email);
      setRuolo(utente.ruolo);
      setClienteId(utente.cliente_id || null);
      setPassword("");
    } else {
      setSelected(null);
      setEmail("");
      setRuolo("operatore");
      setClienteId(null);
      setPassword("");
    }
    onOpen();
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">👥 Gestione Utenti</Heading>
        <Image
          src="/servizinet_logo.png"
          alt="Logo"
          boxSize="160px"
          objectFit="contain"
        />
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={() => navigate("/dashboard")}>
            📊 Dashboard
          </Button>
          <Button colorScheme="red" onClick={logout}>
            🚪 Logout
          </Button>
        </HStack>
      </Flex>

      {/* Box tabella */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        {/* FILTRI */}
        <HStack mb={4} spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Cerca per email..."
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
            />
          </InputGroup>
          
          <Select
            placeholder="Tutti i ruoli"
            value={filtroRuolo}
            onChange={(e) => setFiltroRuolo(e.target.value)}
            width="200px"
          >
            <option value="admin">Admin</option>
            <option value="operatore">Operatore</option>
          </Select>

          <Button
            onClick={() => {
              setFiltroEmail("");
              setFiltroRuolo("");
            }}
            colorScheme="gray"
          >
            Reset Filtri
          </Button>

         <Button
  leftIcon={<AddIcon />}
  colorScheme="blue"
  onClick={() => openModal()}
  ml="auto"
  px={4}
  minW="160px" // ✅ Più larghezza per il testo completo
>
  Aggiungi Utente
</Button>
        </HStack>

        <Table>
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Ruolo</Th>
              <Th>Cliente</Th>
              <Th>Creato il</Th>
              <Th>Azioni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {utentiFiltrati.map((u) => (
              <Tr key={u.id}>
                <Td>{u.email}</Td>
                <Td>{u.ruolo}</Td>
                <Td>
                  {u.cliente_id
                    ? clienti.find((c) => c.id === u.cliente_id)?.nome_sala
                    : "-"}
                </Td>
                <Td>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString("it-IT")
                    : "-"}
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      aria-label="Modifica"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => openModal(u)}
                    />
                    <IconButton
                      aria-label="Elimina"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(u.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Messaggio se nessun risultato */}
        {utentiFiltrati.length === 0 && (
          <Box textAlign="center" py={4} color="gray.500">
            {utenti.length === 0 
              ? "Nessun utente trovato" 
              : "Nessun utente corrisponde ai filtri selezionati"
            }
          </Box>
        )}
      </Box>

      {/* Modale Aggiungi/Modifica Utente */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selected ? "Modifica Utente" : "Nuovo Utente"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Password {selected && "(lascia vuoto per non cambiare)"}</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={selected ? "Nuova password (opzionale)" : "Password"}
              />
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Ruolo</FormLabel>
              <Select
                value={ruolo}
                onChange={(e) => setRuolo(e.target.value as "admin" | "operatore")}
              >
                <option value="operatore">Operatore</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Cliente (solo per Operatore)</FormLabel>
              <Select
                placeholder="Seleziona cliente"
                value={clienteId || ""}
                onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
                isDisabled={ruolo === "admin"}
              >
                {clienti.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome_sala}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Salva
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Annulla
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
