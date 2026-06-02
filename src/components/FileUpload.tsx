import { useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { useToast } from '../toast';

const TEMPLATE_OPTIONS = [
  { id: 'default', file: '/exemplo_topsis.csv', fileName: 'exemplo_topsis.csv', nameKey: 'template.default' },
  { id: 'cars', file: '/modelo_carros.csv', fileName: 'modelo_carros.csv', nameKey: 'template.cars' },
  { id: 'health', file: '/modelo_saude.csv', fileName: 'modelo_saude.csv', nameKey: 'template.health' },
  { id: 'hdi', file: '/modelo_idh.csv', fileName: 'modelo_idh.csv', nameKey: 'template.hdi' },
  { id: 'esg', file: '/modelo_esg.csv', fileName: 'modelo_esg.csv', nameKey: 'template.esg' },
  { id: 'article', file: '/topsis_rad_article.csv', fileName: 'topsis_rad_article.csv', nameKey: 'template.article' },
] as const;

interface FileUploadProps {
  onFileLoaded: (content: string, fileName: string) => void;
  acceptedTypes?: string;
}

export function FileUpload({ onFileLoaded, acceptedTypes = '.csv' }: FileUploadProps) {
  const { t } = useI18n();
  const { show } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<(typeof TEMPLATE_OPTIONS)[number]['id']>('default');
  const selectedTemplate = useMemo(
    () => TEMPLATE_OPTIONS.find((tpl) => tpl.id === selectedTemplateId) ?? TEMPLATE_OPTIONS[0],
    [selectedTemplateId]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => {
      show(t('upload.readError'));
    };
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileLoaded(content, file.name);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleLoadTemplate = async () => {
    try {
      const response = await fetch(selectedTemplate.file);
      if (!response.ok) {
        show(t('toast.templateError'));
        return;
      }
      const content = await response.text();
      onFileLoaded(content, selectedTemplate.fileName);
    } catch (err) {
      console.error('Failed to load template:', err);
      show(t('toast.templateError'));
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
        aria-label={t('upload.aria')}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="file-upload__button file-upload__button--primary"
      >
        {t('upload.button')}
      </button>
      <span className="file-upload__divider">{t('upload.or')}</span>
      <div className="file-upload__templates">
        <label htmlFor="template-select" className="file-upload__templates-label">
          {t('upload.chooseModel')}
        </label>
        <select
          id="template-select"
          className="file-upload__select"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value as (typeof TEMPLATE_OPTIONS)[number]['id'])}
        >
          {TEMPLATE_OPTIONS.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {t(tpl.nameKey)}
            </option>
          ))}
        </select>
      </div>
      <a
        href={selectedTemplate.file}
        download={selectedTemplate.fileName}
        className="file-upload__button file-upload__button--download"
      >
        {t('upload.downloadExample')}
      </a>
      <button
        type="button"
        onClick={handleLoadTemplate}
        className="file-upload__button file-upload__button--secondary"
      >
        {t('upload.loadModel')}
      </button>
    </div>
  );
}
