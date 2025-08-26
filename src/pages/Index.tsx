import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { FirestoreConfig } from '@/components/FirestoreConfig';
import { useToast } from '@/hooks/use-toast';
import { Send, FileText, Activity, Settings } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

interface MedicalRecord {
  ecg: string;
  laudo: string;
  descricao: string;
}

interface FirestoreCredentials {
  projectId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  collectionName: string;
}

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('data');
  const [isConnected, setIsConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [record, setRecord] = useState<MedicalRecord>({
    ecg: '',
    laudo: '',
    descricao: ''
  });

  // Check if credentials exist on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('firestore_credentials');
    if (savedCredentials) {
      setIsConnected(true);
    }
  }, []);

  const handleCredentialsSave = (credentials: FirestoreCredentials) => {
    setIsConnected(true);
    console.log('Firebase credentials saved:', credentials);
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: "Conexão necessária",
        description: "Configure as credenciais do Firestore na aba Configurações",
        variant: "destructive"
      });
      setActiveTab('config');
      return;
    }

    if (!record.ecg || !record.laudo || !record.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos antes de enviar",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get saved credentials from localStorage
      const savedCredentials = localStorage.getItem('firestore_credentials');
      if (!savedCredentials) {
        throw new Error('Credenciais não encontradas');
      }

      const credentials: FirestoreCredentials = JSON.parse(savedCredentials);
      
      // Initialize Firebase
      const firebaseConfig = {
        apiKey: credentials.apiKey,
        authDomain: credentials.authDomain,
        projectId: credentials.projectId,
        storageBucket: credentials.storageBucket,
        messagingSenderId: credentials.messagingSenderId,
        appId: credentials.appId
      };

      const app = initializeApp(firebaseConfig, `medical-app-${Date.now()}`);
      const db = getFirestore(app);

      // Send data to Firestore
      const docRef = await addDoc(collection(db, credentials.collectionName), {
        ecg: record.ecg,
        laudo: record.laudo,
        descricao: record.descricao,
        timestamp: new Date().toISOString(),
        created_at: new Date()
      });

      console.log('Document written with ID: ', docRef.id);
      
      toast({
        title: "Dados enviados com sucesso!",
        description: `Registro médico salvo no Firestore com ID: ${docRef.id}`,
        variant: "default"
      });

      // Reset form
      setRecord({
        ecg: '',
        laudo: '',
        descricao: ''
      });
    } catch (error) {
      console.error('Error submitting to Firestore:', error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao salvar no Firestore. Verifique sua conexão e credenciais.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Sistema de Registros Médicos
          </h1>
          <p className="text-muted-foreground">
            Gerencie ECGs, laudos e descrições com envio seguro para Firestore
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card" style={{ boxShadow: 'var(--shadow-card)' }}>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Dados Médicos</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            <Card className="border-primary/20" style={{ boxShadow: 'var(--shadow-card)' }}>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-glow/5">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Novo Registro Médico</span>
                </CardTitle>
                <CardDescription>
                  Faça upload dos arquivos ECG e laudo, adicione uma descrição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUpload
                    label="ECG"
                    value={record.ecg}
                    onChange={(value) => setRecord(prev => ({ ...prev, ecg: value }))}
                  />
                  
                  <ImageUpload
                    label="Laudo"
                    value={record.laudo}
                    onChange={(value) => setRecord(prev => ({ ...prev, laudo: value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva os detalhes relevantes do exame..."
                    value={record.descricao}
                    onChange={(e) => setRecord(prev => ({ ...prev, descricao: e.target.value }))}
                    className="min-h-[100px] transition-all duration-200 focus:shadow-md"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300 min-w-[140px]"
                    style={{ boxShadow: 'var(--shadow-medical)' }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Enviar Dados</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <FirestoreConfig
              onCredentialsSave={handleCredentialsSave}
              isConnected={isConnected}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
