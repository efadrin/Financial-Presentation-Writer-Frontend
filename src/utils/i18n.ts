// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: 'Welcome to the Add-in',
        loggingIn: 'Logging in...',
        loginWait: 'Please wait while we log you in...',
        loginFailed: 'Failed to login',
        tokenFailed: 'Failed to acquire token',
        loading: 'Loading...',
        account: 'Account',
        required: '(*)',
        selectAccount: 'Select an account ...',
        settings: 'Settings',
        unexpectedErrorOccured: 'An unexpected error occured',
        somethingwentwrong: 'Something went wrong',
        ok: 'OK',
        language: 'Language',
        selectLanguage: 'Select language',

        // Loading progress messages
        loadingStages: {
          initializing: 'Initializing...',
          processing: 'Processing...',
          completingOperation: 'Completing operation...',
        },

        // Breadcrumb labels
        breadcrumb: {
          home: 'Home',
          draftSubmission: 'User Workflow',
        },

        // Button labels
        buttons: {
          next: 'Next',
          back: 'Back',
          cancel: 'Cancel',
          close: 'Close',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
          add: 'Add',
          remove: 'Remove',
          proceed: 'Proceed',
          continue: 'Continue',
          finish: 'Finish',
          submit: 'Submit',
          reset: 'Reset',
          forceTerminate: 'Force Terminate',
          acceptAll: 'Accept All',
          dismiss: 'Dismiss',
        },

        // Error messages and toast notifications
        errors: {
          errorSubmittingDocument:
            'Failed to submit document. Please try again.',
          pleaseEnterDocumentName: 'Please enter a document name',
        },

        // Common labels and aria labels
        common: {
          close: 'Close',
          more: 'more items',
          email: 'Email',
          source: 'Source',
          accountLabel: 'Account',
        },

        // Settings pane
        settingsPane: {
          database: 'Database',
          selectFinancialDatabase: 'Select financial database',
          chooseDatabase: 'Choose database',
          saveSetting: 'Save Settings',
          noFinancialSources: 'No financial sources available',
          noAccountsAvailable: 'No accounts available',
        },
      },
    },
    // Hindi
    hi: {
      translation: {
        welcome: 'एड-इन में आपका स्वागत है',
        loggingIn: 'लॉग इन हो रहा है...',
        loginWait: 'कृपया प्रतीक्षा करें जब तक हम आपको लॉग इन करते हैं...',
        loginFailed: 'लॉगिन विफल रहा',
        tokenFailed: 'टोकन प्राप्त करने में विफल',
        loading: 'लोड हो रहा है...',
        account: 'खाता',
        required: '(*)',
        selectAccount: 'एक खाता चुनें ...',
        settings: 'सेटिंग्स',
        unexpectedErrorOccured: 'अप्रत्याशित त्रुटि हुई',
        somethingwentwrong: 'कुछ गलत हो गया',
        ok: 'ठीक है',
        language: 'भाषा',
        selectLanguage: 'भाषा चुनें',

        loadingStages: {
          initializing: 'प्रारंभ कर रहे हैं...',
          processing: 'प्रोसेसिंग...',
          completingOperation: 'ऑपरेशन पूरा कर रहे हैं...',
        },

        breadcrumb: {
          home: 'होम',
          draftSubmission: 'User Workflow',
        },

        buttons: {
          next: 'अगला',
          back: 'वापस',
          cancel: 'रद्द करें',
          close: 'बंद करें',
          save: 'सेव करें',
          delete: 'डिलीट करें',
          edit: 'संपादित करें',
          add: 'जोड़ें',
          remove: 'हटाएं',
          proceed: 'आगे बढ़ें',
          continue: 'जारी रखें',
          finish: 'समाप्त करें',
          submit: 'सबमिट करें',
          reset: 'रीसेट करें',
          forceTerminate: 'जबरन समाप्त करें',
          acceptAll: 'सभी स्वीकार करें',
          dismiss: 'खारिज करें',
        },

        errors: {
          errorSubmittingDocument:
            'दस्तावेज़ सबमिट करने में विफल। कृपया पुनः प्रयास करें।',
          pleaseEnterDocumentName: 'कृपया दस्तावेज़ का नाम दर्ज करें',
        },

        common: {
          close: 'बंद करें',
          more: 'और आइटम',
          email: 'ईमेल',
          source: 'स्रोत',
          accountLabel: 'खाता',
        },
      },
    },
    // Japanese
    ja: {
      translation: {
        welcome: 'アドインへようこそ',
        loggingIn: 'ログイン中...',
        loginWait: 'ログインするまでお待ちください...',
        loginFailed: 'ログインに失敗しました',
        tokenFailed: 'トークンの取得に失敗しました',
        loading: '読み込み中...',
        account: 'アカウント',
        required: '(*)',
        selectAccount: 'アカウントを選択してください ...',
        settings: '設定',
        unexpectedErrorOccured: '予期しないエラーが発生しました',
        somethingwentwrong: '問題が発生しました',
        ok: 'OK',
        language: '言語',
        selectLanguage: '言語を選択',

        loadingStages: {
          initializing: '初期化中...',
          processing: '処理中...',
          completingOperation: '操作完了中...',
        },

        breadcrumb: {
          home: 'ホーム',
          draftSubmission: 'User Workflow',
        },

        buttons: {
          next: '次へ',
          back: '戻る',
          cancel: 'キャンセル',
          close: '閉じる',
          save: '保存',
          delete: '削除',
          edit: '編集',
          add: '追加',
          remove: '除去',
          proceed: '続行',
          continue: '継続',
          finish: '完了',
          submit: '送信',
          reset: 'リセット',
          forceTerminate: '強制終了',
          acceptAll: 'すべて承認',
          dismiss: '却下',
        },

        errors: {
          errorSubmittingDocument:
            'ドキュメントの送信に失敗しました。もう一度お試しください。',
          pleaseEnterDocumentName: 'ドキュメント名を入力してください',
        },

        common: {
          close: '閉じる',
          more: 'その他の項目',
          email: 'メール',
          source: 'ソース',
          accountLabel: 'アカウント',
        },
      },
    },
    // Chinese Simplified
    'zh-CN': {
      translation: {
        welcome: '欢迎使用插件',
        loggingIn: '正在登录...',
        loginWait: '请等待，我们正在为您登录...',
        loginFailed: '登录失败',
        tokenFailed: '获取令牌失败',
        loading: '加载中...',
        account: '账户',
        required: '(*)',
        selectAccount: '选择一个账户 ...',
        settings: '设置',
        unexpectedErrorOccured: '发生意外错误',
        somethingwentwrong: '出了点问题',
        ok: '确定',
        language: '语言',
        selectLanguage: '选择语言',

        loadingStages: {
          initializing: '正在初始化...',
          processing: '处理中...',
          completingOperation: '正在完成操作...',
        },

        breadcrumb: {
          home: '首页',
          draftSubmission: 'User Workflow',
        },

        buttons: {
          next: '下一步',
          back: '返回',
          cancel: '取消',
          close: '关闭',
          save: '保存',
          delete: '删除',
          edit: '编辑',
          add: '添加',
          remove: '移除',
          proceed: '继续',
          continue: '继续',
          finish: '完成',
          submit: '提交',
          reset: '重置',
          forceTerminate: '强制终止',
          acceptAll: '全部接受',
          dismiss: '忽略',
        },

        errors: {
          errorSubmittingDocument: '提交文件失败。请重试。',
          pleaseEnterDocumentName: '请输入文件名',
        },

        common: {
          close: '关闭',
          more: '更多项目',
          email: '邮箱',
          source: '来源',
          accountLabel: '账户',
        },
      },
    },
    // Chinese Traditional
    'zh-TW': {
      translation: {
        welcome: '歡迎使用插件',
        loggingIn: '正在登入...',
        loginWait: '請稍候，我們正在為您登入...',
        loginFailed: '登入失敗',
        tokenFailed: '取得令牌失敗',
        loading: '載入中...',
        account: '帳戶',
        required: '(*)',
        selectAccount: '選擇一個帳戶 ...',
        settings: '設定',
        unexpectedErrorOccured: '發生意外錯誤',
        somethingwentwrong: '出了點問題',
        ok: '確定',
        language: '語言',
        selectLanguage: '選擇語言',

        loadingStages: {
          initializing: '正在初始化...',
          processing: '處理中...',
          completingOperation: '正在完成操作...',
        },

        breadcrumb: {
          home: '首頁',
          draftSubmission: 'User Workflow',
        },

        buttons: {
          next: '下一步',
          back: '返回',
          cancel: '取消',
          close: '關閉',
          save: '儲存',
          delete: '刪除',
          edit: '編輯',
          add: '新增',
          remove: '移除',
          proceed: '繼續',
          continue: '繼續',
          finish: '完成',
          submit: '提交',
          reset: '重設',
          forceTerminate: '強制終止',
          acceptAll: '全部接受',
          dismiss: '忽略',
        },

        errors: {
          errorSubmittingDocument: '提交文件失敗。請重試。',
          pleaseEnterDocumentName: '請輸入文件名稱',
        },

        common: {
          close: '關閉',
          more: '更多項目',
          email: '電子郵件',
          source: '來源',
          accountLabel: '帳戶',
        },
      },
    },
    // French
    fr: {
      translation: {
        welcome: "Bienvenue dans le complément",
        loggingIn: 'Connexion en cours...',
        loginWait: 'Veuillez patienter pendant que nous vous connectons...',
        loginFailed: 'Échec de la connexion',
        tokenFailed: "Échec de l'acquisition du jeton",
        loading: 'Chargement...',
        account: 'Compte',
        required: '(*)',
        selectAccount: 'Sélectionnez un compte ...',
        settings: 'Paramètres',
        unexpectedErrorOccured: "Une erreur inattendue s'est produite",
        somethingwentwrong: "Quelque chose s'est mal passé",
        ok: 'OK',
        language: 'Langue',
        selectLanguage: 'Sélectionner la langue',

        loadingStages: {
          initializing: 'Initialisation...',
          processing: 'Traitement...',
          completingOperation: "Achèvement de l'opération...",
        },

        breadcrumb: {
          home: 'Accueil',
          draftSubmission: 'User Workflow',
        },

        buttons: {
          next: 'Suivant',
          back: 'Retour',
          cancel: 'Annuler',
          close: 'Fermer',
          save: 'Enregistrer',
          delete: 'Supprimer',
          edit: 'Modifier',
          add: 'Ajouter',
          remove: 'Retirer',
          proceed: 'Procéder',
          continue: 'Continuer',
          finish: 'Terminer',
          submit: 'Soumettre',
          reset: 'Réinitialiser',
          forceTerminate: 'Forcer la fin',
          acceptAll: 'Tout accepter',
          dismiss: 'Rejeter',
        },

        errors: {
          errorSubmittingDocument:
            'Échec de la soumission du document. Veuillez réessayer.',
          pleaseEnterDocumentName: 'Veuillez entrer un nom de document',
        },

        common: {
          close: 'Fermer',
          more: "plus d'éléments",
          email: 'E-mail',
          source: 'Source',
          accountLabel: 'Compte',
        },
      },
    },
    // Spanish
    es: {
      translation: {
        welcome: 'Bienvenido al complemento',
        loggingIn: 'Iniciando sesión...',
        loginWait:
          'Por favor espere mientras iniciamos su sesión...',
        loginFailed: 'Error al iniciar sesión',
        tokenFailed: 'Error al adquirir token',
        loading: 'Cargando...',
        account: 'Cuenta',
        required: '(*)',
        selectAccount: 'Seleccione una cuenta ...',
        settings: 'Configuración',
        unexpectedErrorOccured: 'Ocurrió un error inesperado',
        somethingwentwrong: 'Algo salió mal',
        ok: 'OK',
        language: 'Idioma',
        selectLanguage: 'Seleccionar idioma',

        loadingStages: {
          initializing: 'Inicializando...',
          processing: 'Procesando...',
          completingOperation: 'Completando operación...',
        },

        breadcrumb: {
          home: 'Inicio',
          draftSubmission: 'User Workflow',
        },

        buttons: {
          next: 'Siguiente',
          back: 'Atrás',
          cancel: 'Cancelar',
          close: 'Cerrar',
          save: 'Guardar',
          delete: 'Eliminar',
          edit: 'Editar',
          add: 'Agregar',
          remove: 'Quitar',
          proceed: 'Proceder',
          continue: 'Continuar',
          finish: 'Finalizar',
          submit: 'Enviar',
          reset: 'Restablecer',
          forceTerminate: 'Forzar terminación',
          acceptAll: 'Aceptar todo',
          dismiss: 'Descartar',
        },

        errors: {
          errorSubmittingDocument:
            'Error al enviar el documento. Por favor intente de nuevo.',
          pleaseEnterDocumentName: 'Por favor ingrese un nombre de documento',
        },

        common: {
          close: 'Cerrar',
          more: 'más elementos',
          email: 'Correo',
          source: 'Fuente',
          accountLabel: 'Cuenta',
        },
      },
    },
    // Italian
    it: {
      translation: {
        welcome: "Benvenuto nell'add-in",
        loggingIn: 'Accesso in corso...',
        loginWait: "Attendere prego mentre effettuiamo l'accesso...",
        loginFailed: "Accesso non riuscito",
        tokenFailed: "Acquisizione del token non riuscita",
        loading: 'Caricamento...',
        account: 'Account',
        required: '(*)',
        selectAccount: 'Seleziona un account ...',
        settings: 'Impostazioni',
        unexpectedErrorOccured: "Si è verificato un errore imprevisto",
        somethingwentwrong: 'Qualcosa è andato storto',
        ok: 'OK',
        language: 'Lingua',
        selectLanguage: 'Seleziona lingua',

        loadingStages: {
          initializing: 'Inizializzazione...',
          processing: 'Elaborazione...',
          completingOperation: "Completamento dell'operazione...",
        },

        breadcrumb: {
          home: 'Home',
          draftSubmission: 'User Workflow',
        },

        buttons: {
          next: 'Avanti',
          back: 'Indietro',
          cancel: 'Annulla',
          close: 'Chiudi',
          save: 'Salva',
          delete: 'Elimina',
          edit: 'Modifica',
          add: 'Aggiungi',
          remove: 'Rimuovi',
          proceed: 'Procedi',
          continue: 'Continua',
          finish: 'Fine',
          submit: 'Invia',
          reset: 'Ripristina',
          forceTerminate: 'Forza terminazione',
          acceptAll: 'Accetta tutto',
          dismiss: 'Ignora',
        },

        errors: {
          errorSubmittingDocument:
            "Invio del documento non riuscito. Riprovare.",
          pleaseEnterDocumentName: 'Inserire un nome del documento',
        },

        common: {
          close: 'Chiudi',
          more: 'altri elementi',
          email: 'E-mail',
          source: 'Fonte',
          accountLabel: 'Account',
        },
      },
    },
    // German (for Swiss)
    de: {
      translation: {
        welcome: 'Willkommen im Add-in',
        loggingIn: 'Anmeldung...',
        loginWait: 'Bitte warten Sie, während wir Sie anmelden...',
        loginFailed: 'Anmeldung fehlgeschlagen',
        tokenFailed: 'Token-Abruf fehlgeschlagen',
        loading: 'Laden...',
        account: 'Konto',
        required: '(*)',
        selectAccount: 'Konto auswählen ...',
        settings: 'Einstellungen',
        unexpectedErrorOccured: 'Ein unerwarteter Fehler ist aufgetreten',
        somethingwentwrong: 'Etwas ist schiefgelaufen',
        ok: 'OK',
        language: 'Sprache',
        selectLanguage: 'Sprache auswählen',

        loadingStages: {
          initializing: 'Wird initialisiert...',
          processing: 'Verarbeitung...',
          completingOperation: 'Vorgang wird abgeschlossen...',
        },

        breadcrumb: {
          home: 'Startseite',
          draftSubmission: 'User Workflow',
        },

        buttons: {
          next: 'Weiter',
          back: 'Zurück',
          cancel: 'Abbrechen',
          close: 'Schließen',
          save: 'Speichern',
          delete: 'Löschen',
          edit: 'Bearbeiten',
          add: 'Hinzufügen',
          remove: 'Entfernen',
          proceed: 'Fortfahren',
          continue: 'Weiter',
          finish: 'Abschließen',
          submit: 'Absenden',
          reset: 'Zurücksetzen',
          forceTerminate: 'Erzwingen beenden',
          acceptAll: 'Alle akzeptieren',
          dismiss: 'Verwerfen',
        },

        errors: {
          errorSubmittingDocument:
            'Dokument-Übermittlung fehlgeschlagen. Bitte versuchen Sie es erneut.',
          pleaseEnterDocumentName: 'Bitte geben Sie einen Dokumentnamen ein',
        },

        common: {
          close: 'Schließen',
          more: 'weitere Elemente',
          email: 'E-Mail',
          source: 'Quelle',
          accountLabel: 'Konto',
        },
      },
    },
  },
  lng: 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
