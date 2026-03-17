import { useRef } from 'react';

const EXAMPLE_CSV_URL = '/exemplo_topsis.csv';

interface FileUploadProps {
  onFileLoaded: (content: string, fileName: string) => void;
  acceptedTypes?: string;
}

export function FileUpload({ onFileLoaded, acceptedTypes = '.csv' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileLoaded(content, file.name);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleDownloadExample = async () => {
    try {
      const response = await fetch(EXAMPLE_CSV_URL);
      const content = await response.text();
      onFileLoaded(content, 'exemplo_topsis.csv');
    } catch (err) {
      console.error('Failed to load example:', err);
    }
  };

  return (
    <div className="file-upload">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="file-upload__input"
        aria-label="Carregar planilha"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="file-upload__button file-upload__button--primary"
      >
        Carregar planilha
      </button>
      <span className="file-upload__divider">ou</span>
      <button
        type="button"
        onClick={handleDownloadExample}
        className="file-upload__button file-upload__button--secondary"
      >
        Baixar exemplo
      </button>
    </div>
  );
}
