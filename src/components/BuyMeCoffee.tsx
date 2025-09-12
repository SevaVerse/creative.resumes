import Link from "next/link";

export default function BuyMeCoffee() {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span>Enjoying the tool?</span>
      <Link
        href="https://www.buymeacoffee.com/yourusername" // Replace with actual link later
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800/30 transition-colors"
      >
        <span>☕</span>
        <span>Buy me a coffee</span>
      </Link>
    </div>
  );
}