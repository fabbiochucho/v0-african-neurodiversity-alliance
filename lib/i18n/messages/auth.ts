// Sign-in, sign-up and confirmation pages. English, then French and
// Portuguese drafts (machine translation, 2026-10-21, awaiting review).
export const en = {
  "auth.welcomeBack": "Welcome Back",
  "auth.signInIntro": "Sign in to your ANDA account",
  "auth.email": "Email Address",
  "auth.password": "Password",
  "auth.signingIn": "Signing in...",
  "auth.signIn": "Sign In",
  "auth.noAccount": "Don't have an account?",
  "auth.createAccount": "Create Account",
  "auth.creatingAccount": "Creating Account...",
  "auth.genericError": "An error occurred. Please try again.",
  "auth.join": "Join ANDA",
  "auth.joinIntro": "Create your account to get started",
  "auth.firstName": "First Name",
  "auth.lastName": "Last Name",
  "auth.confirmPassword": "Confirm Password",
  "auth.passwordHint":
    "At least 12 characters, with an uppercase letter, a lowercase letter, a number and a symbol such as ! or #",
  "auth.passwordsDontMatch": "Passwords do not match",
  "auth.passwordTooWeak":
    "Password must be at least 12 characters, with an uppercase letter, a lowercase letter, a number and a symbol",
  "auth.agreeStart": "By selecting Create Account, you confirm you're 18 or older and agree to our",
  "auth.agreeTerms": "Terms of Service",
  "auth.agreeAnd": "and",
  "auth.agreePrivacy": "Privacy Policy",
  "auth.haveAccount": "Already have an account?",
  "auth.checkEmail": "Check Your Email",
  "auth.checkEmailText":
    "We've sent a confirmation link to your email address. Please click the link to verify your account.",
  "auth.noEmailTitle": "Didn't receive an email?",
  "auth.noEmailText": "Check your spam folder or contact our support team.",
  "auth.onceVerified": "Once verified, you can sign in to your account",
  "auth.backToLogin": "Back to Login",
}

type Draft = Partial<Record<keyof typeof en, string>>

export const fr: Draft = {
  "auth.welcomeBack": "Bon retour",
  "auth.signInIntro": "Connectez-vous à votre compte ANDA",
  "auth.email": "Adresse e-mail",
  "auth.password": "Mot de passe",
  "auth.signingIn": "Connexion...",
  "auth.signIn": "Se connecter",
  "auth.noAccount": "Vous n'avez pas de compte ?",
  "auth.createAccount": "Créer un compte",
  "auth.creatingAccount": "Création du compte...",
  "auth.genericError": "Une erreur s'est produite. Veuillez réessayer.",
  "auth.join": "Rejoindre ANDA",
  "auth.joinIntro": "Créez votre compte pour commencer",
  "auth.firstName": "Prénom",
  "auth.lastName": "Nom",
  "auth.confirmPassword": "Confirmer le mot de passe",
  "auth.passwordHint":
    "Au moins 12 caractères, avec une majuscule, une minuscule, un chiffre et un symbole comme ! ou #",
  "auth.passwordsDontMatch": "Les mots de passe ne correspondent pas",
  "auth.passwordTooWeak":
    "Le mot de passe doit contenir au moins 12 caractères, avec une majuscule, une minuscule, un chiffre et un symbole",
  "auth.agreeStart": "En sélectionnant Créer un compte, vous confirmez avoir 18 ans ou plus et acceptez nos",
  "auth.agreeTerms": "Conditions d'utilisation",
  "auth.agreeAnd": "et notre",
  "auth.agreePrivacy": "Politique de confidentialité",
  "auth.haveAccount": "Vous avez déjà un compte ?",
  "auth.checkEmail": "Vérifiez vos e-mails",
  "auth.checkEmailText":
    "Nous avons envoyé un lien de confirmation à votre adresse e-mail. Cliquez sur ce lien pour valider votre compte.",
  "auth.noEmailTitle": "Vous n'avez pas reçu d'e-mail ?",
  "auth.noEmailText": "Vérifiez votre dossier de courrier indésirable ou contactez notre équipe d'assistance.",
  "auth.onceVerified": "Une fois votre compte validé, vous pourrez vous connecter",
  "auth.backToLogin": "Retour à la connexion",
}

export const pt: Draft = {
  "auth.welcomeBack": "Bem-vindo de volta",
  "auth.signInIntro": "Inicie sessão na sua conta ANDA",
  "auth.email": "Endereço de e-mail",
  "auth.password": "Palavra-passe",
  "auth.signingIn": "A iniciar sessão...",
  "auth.signIn": "Iniciar sessão",
  "auth.noAccount": "Não tem conta?",
  "auth.createAccount": "Criar conta",
  "auth.creatingAccount": "A criar conta...",
  "auth.genericError": "Ocorreu um erro. Tente novamente.",
  "auth.join": "Junte-se à ANDA",
  "auth.joinIntro": "Crie a sua conta para começar",
  "auth.firstName": "Nome próprio",
  "auth.lastName": "Apelido",
  "auth.confirmPassword": "Confirmar palavra-passe",
  "auth.passwordHint":
    "Pelo menos 12 caracteres, com uma letra maiúscula, uma minúscula, um número e um símbolo como ! ou #",
  "auth.passwordsDontMatch": "As palavras-passe não coincidem",
  "auth.passwordTooWeak":
    "A palavra-passe deve ter pelo menos 12 caracteres, com uma letra maiúscula, uma minúscula, um número e um símbolo",
  "auth.agreeStart": "Ao selecionar Criar conta, confirma que tem 18 anos ou mais e aceita os nossos",
  "auth.agreeTerms": "Termos de utilização",
  "auth.agreeAnd": "e a nossa",
  "auth.agreePrivacy": "Política de privacidade",
  "auth.haveAccount": "Já tem conta?",
  "auth.checkEmail": "Verifique o seu e-mail",
  "auth.checkEmailText":
    "Enviámos um link de confirmação para o seu endereço de e-mail. Clique no link para validar a sua conta.",
  "auth.noEmailTitle": "Não recebeu o e-mail?",
  "auth.noEmailText": "Verifique a pasta de spam ou contacte a nossa equipa de apoio.",
  "auth.onceVerified": "Depois de validada, pode iniciar sessão na sua conta",
  "auth.backToLogin": "Voltar ao início de sessão",
}
