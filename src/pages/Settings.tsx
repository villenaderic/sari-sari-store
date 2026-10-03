import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Settings() {
  const [storeName, setStoreName] = useState("Sari-Sari Store");
  const [address, setAddress] = useState("Manila, Philippines");
  const [phone, setPhone] = useState("+63 900 000 0000");
  
  const handleSave = () => {
    // Save to localStorage or DB
    alert("Settings saved!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Update your store details for receipts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Store Name</label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          
          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
