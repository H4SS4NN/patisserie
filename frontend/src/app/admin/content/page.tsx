'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  getPageContents,
  getPageContentBySlug,
  upsertPageContent,
} from '@/lib/adminApi';
import { PageContent } from '@/types';
import styles from './page.module.scss';

type GenericContent = Record<string, any>;

interface SiteInfoContent {
  brandName?: string;
  adminBrandName?: string;
  footerText?: string;
  socialLinks?: Array<{ id?: string; platform: string; url: string }>;
}

interface HomeContent {
  heroTitle?: string;
  heroSubtitle?: string;
}

interface AboutSection {
  id?: string;
  title: string;
  paragraphs: string[];
}

interface AboutValue {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

interface AboutContent {
  heroTitle?: string;
  heroSubtitle?: string;
  sections?: AboutSection[];
  values?: AboutValue[];
}

interface ContactInfoItem {
  id?: string;
  title: string;
  icon?: string;
  lines: string[];
  note?: string;
}

interface ContactContent {
  heroTitle?: string;
  heroSubtitle?: string;
  introText?: string;
  contactInfo?: ContactInfoItem[];
  socialLinks?: Array<{ id?: string; platform: string; url: string }>;
}

const structuredPages = new Set(['site-info', 'home', 'a-propos', 'contact']);

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

function sanitizeSiteInfo(content: GenericContent): SiteInfoContent {
  const socialLinks = Array.isArray(content.socialLinks)
    ? content.socialLinks
        .map((link: any) => ({
          id: link.id || generateId(),
          platform: (link.platform ?? '').toString().trim(),
          url: (link.url ?? '').toString().trim(),
        }))
        .filter((link) => link.platform && link.url)
    : [];

  return {
    brandName: content.brandName?.toString().trim() || 'Assia',
    adminBrandName: content.adminBrandName?.toString().trim() || content.brandName?.toString().trim() || 'Assia Admin',
    footerText: content.footerText?.toString().trim() || '© 2024 Assia. Tous droits réservés.',
    socialLinks,
  };
}

function sanitizeHome(content: GenericContent): HomeContent {
  return {
    heroTitle: content.heroTitle?.toString().trim() || 'Découvrez Nos Gâteaux',
    heroSubtitle:
      content.heroSubtitle?.toString().trim() ||
      'Fabriqués à la main avec passion par Assia, des recettes classiques aux créations sur mesure.',
  };
}

function sanitizeAbout(content: GenericContent): AboutContent {
  const sections = Array.isArray(content.sections)
    ? content.sections
        .map((section: any) => ({
          id: section.id || generateId(),
          title: section.title?.toString().trim() || '',
          paragraphs: Array.isArray(section.paragraphs)
            ? section.paragraphs
                .map((paragraph: any) => paragraph?.toString().trim() || '')
                .filter((paragraph: string) => paragraph.length > 0)
            : [],
        }))
        .filter((section: AboutSection) => section.title || section.paragraphs.length > 0)
    : [];

  const values = Array.isArray(content.values)
    ? content.values
        .map((value: any) => ({
          id: value.id || generateId(),
          title: value.title?.toString().trim() || '',
          description: value.description?.toString().trim() || '',
          icon: value.icon?.toString().trim() || 'heart',
        }))
        .filter((value: AboutValue) => value.title || value.description)
    : [];

  return {
    heroTitle: content.heroTitle?.toString().trim() || "À Propos d'Assia",
    heroSubtitle: content.heroSubtitle?.toString().trim() || "L'art de la pâtisserie artisanale depuis 2015",
    sections,
    values,
  };
}

function sanitizeContact(content: GenericContent): ContactContent {
  const contactInfo = Array.isArray(content.contactInfo)
    ? content.contactInfo
        .map((item: any) => ({
          id: item.id || generateId(),
          title: item.title?.toString().trim() || '',
          icon: item.icon?.toString().trim(),
          lines: Array.isArray(item.lines)
            ? item.lines
                .map((line: any) => line?.toString().trim() || '')
                .filter((line: string) => line.length > 0)
            : [],
          note: item.note?.toString().trim() || undefined,
        }))
        .filter((item: ContactInfoItem) => item.title || item.lines.length > 0)
    : [];

  const socialLinks = Array.isArray(content.socialLinks)
    ? content.socialLinks
        .map((link: any) => ({
          id: link.id || generateId(),
          platform: link.platform?.toString().trim() || '',
          url: link.url?.toString().trim() || '',
        }))
        .filter((link: SocialLink) => link.platform && link.url)
    : [];

  return {
    heroTitle: content.heroTitle?.toString().trim() || 'Contactez Assia',
    heroSubtitle:
      content.heroSubtitle?.toString().trim() ||
      "Nous serions ravis d'entendre parler de vous et de répondre à toutes vos questions",
    introText:
      content.introText?.toString().trim() ||
      "Vous avez une question ? Une demande de devis pour un gâteau sur mesure ? N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.",
    contactInfo,
    socialLinks,
  };
}

function sanitizeContent(slug: string, content: GenericContent): GenericContent {
  switch (slug) {
    case 'site-info':
      return sanitizeSiteInfo(content);
    case 'home':
      return sanitizeHome(content);
    case 'a-propos':
      return sanitizeAbout(content);
    case 'contact':
      return sanitizeContact(content);
    default:
      return content || {};
  }
}

export default function ContentAdminPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentState, setContentState] = useState<GenericContent>({});
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      loadPage(selectedSlug);
    }
  }, [selectedSlug]);

  const loadPages = async () => {
    try {
      setLoadingList(true);
      const list = await getPageContents();
      setPages(list);
      if (!selectedSlug && list.length > 0) {
        setSelectedSlug(list[0].slug);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      setErrorMessage('Impossible de charger la liste des pages.');
    } finally {
      setLoadingList(false);
    }
  };

  const loadPage = async (slug: string) => {
    try {
      setLoadingPage(true);
      setErrorMessage(null);
      const page = await getPageContentBySlug(slug);
      setTitle(page.title);
      setDescription(page.description || '');
      setContentState(page.content || {});
    } catch (error) {
      console.error('Error loading page content:', error);
      setErrorMessage("Impossible de charger le contenu de la page sélectionnée.");
      setTitle('');
      setDescription('');
      setContentState({});
    } finally {
      setLoadingPage(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSlug) {
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Le titre est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const sanitizedContent = sanitizeContent(selectedSlug, contentState);

      const saved = await upsertPageContent(selectedSlug, {
        title: title.trim(),
        description: description.trim() || undefined,
        content: sanitizedContent,
      });

      setContentState(saved.content || {});
      setSuccessMessage('Contenu enregistré avec succès.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await loadPages();
    } catch (error: any) {
      console.error('Error saving page content:', error);
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la sauvegarde du contenu.');
    } finally {
      setSaving(false);
    }
  };

  const selectedPageMeta = useMemo(() => pages.find((page) => page.slug === selectedSlug), [pages, selectedSlug]);

  const renderEditor = () => {
    const commonProps = {
      value: contentState,
      onChange: setContentState,
    };

    switch (selectedSlug) {
      case 'site-info':
        return <SiteInfoEditor {...commonProps} />;
      case 'home':
        return <HomeContentEditor {...commonProps} />;
      case 'a-propos':
        return <AboutContentEditor {...commonProps} />;
      case 'contact':
        return <ContactContentEditor {...commonProps} />;
      default:
        return <JsonContentEditor {...commonProps} />;
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Pages</h2>
          <button className={styles.refreshButton} onClick={loadPages} disabled={loadingList}>
            Actualiser
          </button>
        </div>
        {loadingList ? (
          <div className={styles.loadingState}>Chargement...</div>
        ) : pages.length === 0 ? (
          <div className={styles.emptyState}>Aucune page enregistrée pour le moment.</div>
        ) : (
          <ul className={styles.pageList}>
            {pages.map((page) => (
              <li key={page.id}>
                <button
                  type="button"
                  className={
                    page.slug === selectedSlug
                      ? `${styles.pageButton} ${styles.pageButtonActive}`
                      : styles.pageButton
                  }
                  onClick={() => setSelectedSlug(page.slug)}
                >
                  <span>{page.title}</span>
                  <small>{page.slug}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className={styles.editor}>
        {!selectedSlug ? (
          <div className={styles.emptyState}>Sélectionnez une page pour commencer la modification.</div>
        ) : loadingPage ? (
          <div className={styles.loadingState}>Chargement du contenu...</div>
        ) : (
          <>
            <header className={styles.headerRow}>
              <div>
                <h1>Modifier « {title || selectedSlug} »</h1>
                {selectedPageMeta?.updated_at && (
                  <p className={styles.subtitle}>
                    Dernière mise à jour : {new Date(selectedPageMeta.updated_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            </header>

            <div className={styles.metaForm}>
              <div className={styles.field}>
                <label htmlFor="page-title">Titre</label>
                <input
                  id="page-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Titre administratif de la page"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="page-description">Description</label>
                <textarea
                  id="page-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Description optionnelle pour documenter la page"
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.editorSection}>{renderEditor()}</div>

            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
            {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

            <div className={styles.actions}>
              <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

type EditorProps<T = GenericContent> = {
  value: GenericContent;
  onChange: (next: T) => void;
};

function SiteInfoEditor({ value, onChange }: EditorProps<SiteInfoContent>) {
  const content = sanitizeSiteInfo(value);

  const handleFieldChange = (field: keyof SiteInfoContent, nextValue: string) => {
    const next = { ...content, [field]: nextValue };
    onChange(next);
  };

  const handleSocialChange = (index: number, key: 'platform' | 'url', nextValue: string) => {
    const updated = [...(content.socialLinks ?? [])];
    updated[index] = {
      id: updated[index]?.id || generateId(),
      platform: key === 'platform' ? nextValue : updated[index]?.platform || '',
      url: key === 'url' ? nextValue : updated[index]?.url || '',
    };
    onChange({ ...content, socialLinks: updated });
  };

  const addSocialLink = () => {
    const updated = [...(content.socialLinks ?? []), { id: generateId(), platform: '', url: '' }];
    onChange({ ...content, socialLinks: updated });
  };

  const removeSocialLink = (index: number) => {
    const updated = [...(content.socialLinks ?? [])];
    updated.splice(index, 1);
    onChange({ ...content, socialLinks: updated });
  };

  return (
    <div className={styles.panel}>
      <h2>Paramètres généraux</h2>
      <div className={styles.gridTwoCols}>
        <div className={styles.field}>
          <label>Nom de la marque</label>
          <input
            type="text"
            value={content.brandName || ''}
            onChange={(event) => handleFieldChange('brandName', event.target.value)}
            placeholder="Assia"
          />
        </div>
        <div className={styles.field}>
          <label>Nom de l'interface admin</label>
          <input
            type="text"
            value={content.adminBrandName || ''}
            onChange={(event) => handleFieldChange('adminBrandName', event.target.value)}
            placeholder="Assia Admin"
          />
        </div>
      </div>
      <div className={styles.field}>
        <label>Texte du pied de page</label>
        <textarea
          value={content.footerText || ''}
          onChange={(event) => handleFieldChange('footerText', event.target.value)}
          rows={2}
        />
      </div>

      <div className={styles.field}>
        <label>Réseaux sociaux</label>
        <div className={styles.socialList}>
          {(content.socialLinks ?? []).map((link, index) => (
            <div key={link.id || index} className={styles.socialItem}>
              <input
                type="text"
                value={link.platform}
                onChange={(event) => handleSocialChange(index, 'platform', event.target.value)}
                placeholder="facebook, instagram..."
              />
              <input
                type="url"
                value={link.url}
                onChange={(event) => handleSocialChange(index, 'url', event.target.value)}
                placeholder="https://"
              />
              <button type="button" onClick={() => removeSocialLink(index)} className={styles.smallButton}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSocialLink} className={styles.secondaryButton}>
          Ajouter un réseau social
        </button>
      </div>
    </div>
  );
}

function HomeContentEditor({ value, onChange }: EditorProps<HomeContent>) {
  const content = sanitizeHome(value);

  return (
    <div className={styles.panel}>
      <h2>Contenu de la page d'accueil</h2>
      <div className={styles.field}>
        <label>Titre principal</label>
        <input
          type="text"
          value={content.heroTitle || ''}
          onChange={(event) => onChange({ ...content, heroTitle: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label>Sous-titre</label>
        <textarea
          value={content.heroSubtitle || ''}
          onChange={(event) => onChange({ ...content, heroSubtitle: event.target.value })}
          rows={2}
        />
      </div>
    </div>
  );
}

function AboutContentEditor({ value, onChange }: EditorProps<AboutContent>) {
  const content = sanitizeAbout(value);

  const updateSections = (sections: AboutSection[]) => {
    onChange({ ...content, sections });
  };

  const updateValues = (values: AboutValue[]) => {
    onChange({ ...content, values });
  };

  const handleSectionChange = (index: number, updates: Partial<AboutSection>) => {
    const sections = [...(content.sections ?? [])];
    sections[index] = {
      ...sections[index],
      ...updates,
    };
    updateSections(sections);
  };

  const handleSectionParagraphsChange = (index: number, text: string) => {
    const paragraphs = text
      .split(/\n{2,}|\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
    handleSectionChange(index, { paragraphs });
  };

  const addSection = () => {
    const sections = [...(content.sections ?? []), { id: generateId(), title: '', paragraphs: [] }];
    updateSections(sections);
  };

  const removeSection = (index: number) => {
    const sections = [...(content.sections ?? [])];
    sections.splice(index, 1);
    updateSections(sections);
  };

  const handleValueChange = (index: number, updates: Partial<AboutValue>) => {
    const values = [...(content.values ?? [])];
    values[index] = {
      ...values[index],
      ...updates,
    };
    updateValues(values);
  };

  const addValue = () => {
    const values = [...(content.values ?? []), { id: generateId(), title: '', description: '', icon: 'heart' }];
    updateValues(values);
  };

  const removeValue = (index: number) => {
    const values = [...(content.values ?? [])];
    values.splice(index, 1);
    updateValues(values);
  };

  return (
    <div className={styles.panel}>
      <h2>Contenu de la page « À propos »</h2>
      <div className={styles.field}>
        <label>Titre principal</label>
        <input
          type="text"
          value={content.heroTitle || ''}
          onChange={(event) => onChange({ ...content, heroTitle: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label>Sous-titre</label>
        <textarea
          value={content.heroSubtitle || ''}
          onChange={(event) => onChange({ ...content, heroSubtitle: event.target.value })}
          rows={2}
        />
      </div>

      <div className={styles.sectionHeader}>
        <h3>Sections</h3>
        <button type="button" onClick={addSection} className={styles.secondaryButton}>
          Ajouter une section
        </button>
      </div>
      <div className={styles.sectionList}>
        {(content.sections ?? []).map((section, index) => (
          <div key={section.id || index} className={styles.sectionCard}>
            <div className={styles.field}>
              <label>Titre de la section</label>
              <input
                type="text"
                value={section.title}
                onChange={(event) => handleSectionChange(index, { title: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Paragraphes (séparés par une ligne vide)</label>
              <textarea
                value={(section.paragraphs || []).join('\n\n')}
                onChange={(event) => handleSectionParagraphsChange(index, event.target.value)}
                rows={6}
              />
            </div>
            <div className={styles.itemActions}>
              <button type="button" onClick={() => removeSection(index)} className={styles.smallButton}>
                Supprimer la section
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <h3>Valeurs</h3>
        <button type="button" onClick={addValue} className={styles.secondaryButton}>
          Ajouter une valeur
        </button>
      </div>
      <div className={styles.sectionList}>
        {(content.values ?? []).map((value, index) => (
          <div key={value.id || index} className={styles.sectionCard}>
            <div className={styles.gridTwoCols}>
              <div className={styles.field}>
                <label>Titre</label>
                <input
                  type="text"
                  value={value.title}
                  onChange={(event) => handleValueChange(index, { title: event.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Icône</label>
                <select
                  value={value.icon || 'heart'}
                  onChange={(event) => handleValueChange(index, { icon: event.target.value })}
                >
                  <option value="heart">Cœur</option>
                  <option value="award">Trophée</option>
                  <option value="leaf">Feuille</option>
                  <option value="users">Équipe</option>
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label>Description</label>
              <textarea
                value={value.description}
                onChange={(event) => handleValueChange(index, { description: event.target.value })}
                rows={3}
              />
            </div>
            <div className={styles.itemActions}>
              <button type="button" onClick={() => removeValue(index)} className={styles.smallButton}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactContentEditor({ value, onChange }: EditorProps<ContactContent>) {
  const content = sanitizeContact(value);

  const handleInfoChange = (index: number, updates: Partial<ContactInfoItem>) => {
    const info = [...(content.contactInfo ?? [])];
    info[index] = {
      ...info[index],
      ...updates,
    };
    onChange({ ...content, contactInfo: info });
  };

  const handleInfoLinesChange = (index: number, text: string) => {
    const lines = text
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    handleInfoChange(index, { lines });
  };

  const addInfoItem = () => {
    const info = [...(content.contactInfo ?? []), { id: generateId(), title: '', icon: 'map-marker', lines: [] }];
    onChange({ ...content, contactInfo: info });
  };

  const removeInfoItem = (index: number) => {
    const info = [...(content.contactInfo ?? [])];
    info.splice(index, 1);
    onChange({ ...content, contactInfo: info });
  };

  const handleSocialChange = (index: number, key: 'platform' | 'url', value: string) => {
    const socialLinks = [...(content.socialLinks ?? [])];
    socialLinks[index] = {
      id: socialLinks[index]?.id || generateId(),
      platform: key === 'platform' ? value : socialLinks[index]?.platform || '',
      url: key === 'url' ? value : socialLinks[index]?.url || '',
    };
    onChange({ ...content, socialLinks });
  };

  const addSocialLink = () => {
    const socialLinks = [...(content.socialLinks ?? []), { id: generateId(), platform: '', url: '' }];
    onChange({ ...content, socialLinks });
  };

  const removeSocialLink = (index: number) => {
    const socialLinks = [...(content.socialLinks ?? [])];
    socialLinks.splice(index, 1);
    onChange({ ...content, socialLinks });
  };

  return (
    <div className={styles.panel}>
      <h2>Contenu de la page Contact</h2>
      <div className={styles.field}>
        <label>Titre principal</label>
        <input
          type="text"
          value={content.heroTitle || ''}
          onChange={(event) => onChange({ ...content, heroTitle: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label>Sous-titre</label>
        <textarea
          value={content.heroSubtitle || ''}
          onChange={(event) => onChange({ ...content, heroSubtitle: event.target.value })}
          rows={2}
        />
      </div>
      <div className={styles.field}>
        <label>Texte d'introduction du formulaire</label>
        <textarea
          value={content.introText || ''}
          onChange={(event) => onChange({ ...content, introText: event.target.value })}
          rows={3}
        />
      </div>

      <div className={styles.sectionHeader}>
        <h3>Blocs d'informations</h3>
        <button type="button" onClick={addInfoItem} className={styles.secondaryButton}>
          Ajouter un bloc
        </button>
      </div>
      <div className={styles.sectionList}>
        {(content.contactInfo ?? []).map((item, index) => (
          <div key={item.id || index} className={styles.sectionCard}>
            <div className={styles.gridTwoCols}>
              <div className={styles.field}>
                <label>Titre</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(event) => handleInfoChange(index, { title: event.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Icône</label>
                <input
                  type="text"
                  value={item.icon || ''}
                  onChange={(event) => handleInfoChange(index, { icon: event.target.value })}
                  placeholder="map-marker, phone, envelope..."
                />
              </div>
            </div>
            <div className={styles.field}>
              <label>Lignes d'information (une par ligne)</label>
              <textarea
                value={(item.lines || []).join('\n')}
                onChange={(event) => handleInfoLinesChange(index, event.target.value)}
                rows={4}
              />
            </div>
            <div className={styles.field}>
              <label>Note</label>
              <input
                type="text"
                value={item.note || ''}
                onChange={(event) => handleInfoChange(index, { note: event.target.value })}
              />
            </div>
            <div className={styles.itemActions}>
              <button type="button" onClick={() => removeInfoItem(index)} className={styles.smallButton}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <h3>Réseaux sociaux</h3>
        <button type="button" onClick={addSocialLink} className={styles.secondaryButton}>
          Ajouter un lien
        </button>
      </div>
      <div className={styles.socialList}>
        {(content.socialLinks ?? []).map((link, index) => (
          <div key={link.id || index} className={styles.socialItem}>
            <input
              type="text"
              value={link.platform}
              onChange={(event) => handleSocialChange(index, 'platform', event.target.value)}
              placeholder="facebook, instagram..."
            />
            <input
              type="url"
              value={link.url}
              onChange={(event) => handleSocialChange(index, 'url', event.target.value)}
              placeholder="https://"
            />
            <button type="button" onClick={() => removeSocialLink(index)} className={styles.smallButton}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function JsonContentEditor({ value, onChange }: EditorProps) {
  const [raw, setRaw] = useState<string>(() => JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRaw(JSON.stringify(value ?? {}, null, 2));
  }, [value]);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(raw || '{}');
      setError(null);
      onChange(parsed);
    } catch (parseError: any) {
      setError('JSON invalide : ' + parseError.message);
    }
  };

  return (
    <div className={styles.panel}>
      <h2>Éditeur JSON avancé</h2>
      <p className={styles.notice}>
        Cette page n'a pas encore d'éditeur visuel. Vous pouvez modifier directement la structure JSON.
      </p>
      <textarea
        className={styles.jsonTextarea}
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        onBlur={handleBlur}
        rows={20}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}


