import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  accept = "image/*"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    setIsLoading(true);
    try {
      const base64 = await convertToBase64(file);
      onChange(base64);
    } catch (error) {
      console.error('Error converting file:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const clearImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Card 
        className={`
          relative overflow-hidden transition-all duration-300
          ${isDragging ? 'border-primary bg-medical-accent scale-[1.02]' : 'border-border'}
          ${value ? 'border-success' : ''}
          hover:shadow-md cursor-pointer
        `}
        style={{ boxShadow: isDragging ? 'var(--shadow-upload)' : 'var(--shadow-card)' }}
      >
        <div
          className="p-6"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {value ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileImage className="h-5 w-5 text-success" />
                  <span className="text-sm text-success font-medium">
                    Imagem carregada
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearImage}
                  className="h-6 w-6 p-0 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="flex justify-center">
                <img 
                  src={value} 
                  alt="Preview" 
                  className="max-h-32 max-w-full object-contain rounded border"
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full flex items-center justify-center">
                <Upload className={`h-6 w-6 transition-colors ${
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-foreground font-medium">
                  {isDragging ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: JPG, PNG, GIF
                </p>
              </div>
              <input
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-primary font-medium">Processando...</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};