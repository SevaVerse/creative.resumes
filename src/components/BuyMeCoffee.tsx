import Link from "next/link";

export default function BuyMeCoffee() {
  return (
    <Link
      href="https://buymeacoffee.com/sevaverse"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200/90 dark:hover:bg-yellow-800/40 transition-colors text-sm font-medium border border-yellow-200/80 dark:border-yellow-800/50"
    >
      <span>☕</span>
      <span>Support the project</span>
    </Link>
  );
}