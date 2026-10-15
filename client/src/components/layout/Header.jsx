import React from "react";
import Navbar from "./Navbar";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <Navbar />
        </header>
    );
};

export default Header;