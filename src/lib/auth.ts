import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null;
        }

        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: credentials.email, 
              senha: credentials.senha 
            }),
          });

          if (response.ok) {
            const data = await response.json();
            return data.corretor;
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Verificar se o usuário já existe ou criar novo
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              nome: user.name,
              google_id: account.providerAccountId,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Atualizar o objeto user com os dados do corretor
            Object.assign(user, data.corretor);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Erro no login com Google:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.corretor = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.corretor) {
        session.user = token.corretor as any;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se o usuário precisa completar cadastro, redirecionar para a página apropriada
      if (url.includes('/completar-cadastro')) {
        return url;
      }
      // Após login bem-sucedido, redirecionar para dashboard
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl + '/dashboard';
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
