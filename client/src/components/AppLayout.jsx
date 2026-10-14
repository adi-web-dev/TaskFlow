import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main className="ml-[256px] min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;