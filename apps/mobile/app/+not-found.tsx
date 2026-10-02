import { Redirect } from 'expo-router';

/** Unknown paths (stale deep links, preview hosts) land on the reading screen. */
export default function NotFound() {
  return <Redirect href="/" />;
}
