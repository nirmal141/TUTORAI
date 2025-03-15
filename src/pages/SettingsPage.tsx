import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useLanguage, Language } from '@/lib/language-context'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          {t('settings.description')}
        </p>
        
        <div className="max-w-2xl space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              {t('settings.general')}
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="theme">{t('settings.theme')}</Label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className={cn(
                    "flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                  )}
                >
                  <option value="light">{t('theme.light')}</option>
                  <option value="dark">{t('theme.dark')}</option>
                  <option value="system">{t('theme.system')}</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className={cn(
                    "flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                  )}
                >
                  <option value="english">{t('language.english')}</option>
                  <option value="spanish">{t('language.spanish')}</option>
                  <option value="french">{t('language.french')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              {t('settings.notifications')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">{t('settings.email')}</Label>
                <Switch id="email-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="desktop-notifications">{t('settings.desktop')}</Label>
                <Switch id="desktop-notifications" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              {t('settings.privacy')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="share-data">{t('settings.share_data')}</Label>
                <Switch id="share-data" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 