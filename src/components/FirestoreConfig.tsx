import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Database, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface FirestoreCredentials {
  projectId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  collectionName: string;
}

interface FirestoreConfigProps {
  onCredentialsSave: (credentials: FirestoreCredentials) => void;
  isConnected: boolean;
}

export const FirestoreConfig: React.FC<FirestoreConfigProps> = ({
  onCredentialsSave,
  isConnected
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<FirestoreCredentials>({
    projectId: '',
    apiKey: '',
    authDomain: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    collectionName: 'medical_records'
  });

  // Load saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem('firestore_credentials');
    if (saved) {
      try {
        const parsedCredentials = JSON.parse(saved);
        setCredentials(parsedCredentials);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof FirestoreCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async (credentialsToTest: FirestoreCredentials) => {
    const firebaseConfig = {
      apiKey: credentialsToTest.apiKey,
      authDomain: credentialsToTest.authDomain,
      projectId: credentialsToTest.projectId,
      storageBucket: credentialsToTest.storageBucket,
      messagingSenderId: credentialsToTest.messagingSenderId,
      appId: credentialsToTest.appId
    };

    try {
      // Initialize Firebase app
      const app = initializeApp(firebaseConfig, `test-app-${Date.now()}`);
      const db = getFirestore(app);

      // Try to add a test document
      const testDoc = await addDoc(collection(db, credentialsToTest.collectionName), {
        test: true,
        timestamp: new Date().toISOString(),
        connectionTest: 'success'
      });

      // Delete the test document immediately
      await deleteDoc(testDoc);

      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = ['projectId', 'apiKey', 'authDomain', 'collectionName'];
    const missingFields = requiredFields.filter(field => !credentials[field as keyof FirestoreCredentials]);

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Por favor, preencha: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Test connection first
      await testConnection(credentials);

      // Save to localStorage only if connection test passes
      localStorage.setItem('firestore_credentials', JSON.stringify(credentials));
      
      // Call parent callback
      onCredentialsSave(credentials);

      toast({
        title: "Conexão bem-sucedida",
        description: "Credenciais salvas e conexão com Firestore testada com sucesso!",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao Firestore. Verifique suas credenciais.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-glow/5">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">Configuração do Firebase Firestore</CardTitle>
          </div>
          <CardDescription>
            Configure as credenciais do seu projeto Firebase para conectar ao Firestore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID *</Label>
              <Input
                id="projectId"
                value={credentials.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                placeholder="meu-projeto-firebase"
                className="transition-all duration-200 focus:shadow-md"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                value={credentials.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="AIzaSyC..."
                className="transition-all duration-200 focus:shadow-md"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="authDomain">Auth Domain *</Label>
              <Input
                id="authDomain"
                value={credentials.authDomain}
                onChange={(e) => handleInputChange('authDomain', e.target.value)}
                placeholder="meu-projeto.firebaseapp.com"
                className="transition-all duration-200 focus:shadow-md"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storageBucket">Storage Bucket</Label>
              <Input
                id="storageBucket"
                value={credentials.storageBucket}
                onChange={(e) => handleInputChange('storageBucket', e.target.value)}
                placeholder="meu-projeto.appspot.com"
                className="transition-all duration-200 focus:shadow-md"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
              <Input
                id="messagingSenderId"
                value={credentials.messagingSenderId}
                onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
                placeholder="123456789"
                className="transition-all duration-200 focus:shadow-md"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appId">App ID</Label>
              <Input
                id="appId"
                value={credentials.appId}
                onChange={(e) => handleInputChange('appId', e.target.value)}
                placeholder="1:123:web:abc..."
                className="transition-all duration-200 focus:shadow-md"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="collectionName">Nome da Coleção *</Label>
            <Input
              id="collectionName"
              value={credentials.collectionName}
              onChange={(e) => handleInputChange('collectionName', e.target.value)}
              placeholder="medical_records"
              className="transition-all duration-200 focus:shadow-md"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              {isConnected && (
                <>
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">
                    Conectado ao Firestore
                  </span>
                </>
              )}
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              style={{ boxShadow: 'var(--shadow-medical)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando Conexão...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-muted">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Como obter as credenciais:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Acesse o <a href="https://console.firebase.google.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Console do Firebase</a></li>
              <li>Selecione seu projeto ou crie um novo</li>
              <li>Vá em "Configurações do projeto" → "Seus aplicativos"</li>
              <li>Clique em "Adicionar app" → "Web" se necessário</li>
              <li>Copie as informações de configuração</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};