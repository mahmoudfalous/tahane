export default function Footer() {
  return (
    <footer className="w-full bg-[#0B0E14] border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} تهاني. عيد أضحى مبارك.
        </p>
      </div>
    </footer>
  );
}
