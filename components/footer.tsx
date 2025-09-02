import Image from "next/image";

const Footer = () => {
    return ( 
        <footer className="bg-secondary w-full row-start-3 flex gap-[14px] flex-wrap items-center justify-center">
            <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href=""
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    aria-hidden
                    src="/window.svg"
                    alt="Window icon"
                    width={16}
                    height={16}
                />
                Examples
            </a>
        </footer>
     );
}
 
export default Footer;