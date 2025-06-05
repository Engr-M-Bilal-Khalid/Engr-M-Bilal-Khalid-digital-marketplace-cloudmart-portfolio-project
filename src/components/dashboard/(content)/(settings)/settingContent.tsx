interface SettingsContentProps {
    userId?:number,
    userRole?:string
}

export const SettingsContent = ({userId,userRole}:SettingsContentProps) => {
    return (
        <>
            <h2 className="text-2xl font-semibold  transition-colors duration-500">Settings</h2>
            <p className="mt-2 text-lg transition-colors duration-500">Application settings.</p>
            {/* Add settings components here */}
        </>)
}