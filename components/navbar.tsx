import { UserButton } from "@clerk/nextjs";
import { MainNav } from "./main-nav";
import StoreSwitcher from "./store-switcher";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { ModeToggle } from "./modal-toggle";

const Navbar = async () => {
    const {userId } = await auth();

    if(!userId){
        redirect("/sign-in");
        }

    const stores = await prismadb.store.findMany({
        where:{
            userId,
        }
    });



    return ( 
        <div className="border-b bg-secondary">
            <div className="flex h-16 items-center px-4">
                <StoreSwitcher items={stores}/>
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                    <UserButton afterSignOutUrl="/" />
                    <ModeToggle />
                </div>
                
                
            </div>
            
        </div>
     );
}
 
export default Navbar;