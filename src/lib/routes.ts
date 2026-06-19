/**
 * Rota inicial conforme o papel do usuário.
 *
 * A home (página com o chat) é exclusiva de administradores. Usuários comuns
 * não acessam a home nem o chat — caem em Licenças, que é seu ponto de entrada.
 */
export function landingPathFor(isAdmin: boolean | undefined): string {
  return isAdmin ? "/home" : "/licencas";
}
