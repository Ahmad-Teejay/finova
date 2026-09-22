    "use client";
    import { Button } from "@/components/ui/button";
    import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import {  useRouter } from "next/navigation";
    import { useState } from "react";
    import axios  from "axios";
    import { toast } from "sonner";
    import { Eye, EyeOff } from "lucide-react";

    export default function SignupPage() {
        const [error, setError] = useState("");
        const [loading, setLoading] = useState(false);
        const router = useRouter();
        const [formData, setFormData] = useState({
                username: "",
                email: "",
                password: "",
        });
        const [showPassword, setShowPassword] = useState(false);
        const handleSubmit = async (e: React.SubmitEvent) => {
            e.preventDefault();
              
            try {
                setError("");
                setLoading(true);

                const response = await axios.post("api/users/signup", formData);

                console.log(response.data);

                toast.success("Account created successfully!");
                router.push("/login")
            } catch (error: any) {
                setError(error.response?.data?.message || "Something went wrong")
            } finally {
                setLoading(false)
            }

        }
    return (
        <main className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
            <CardHeader>
            <CardTitle>Create your Finova account</CardTitle>
            <CardDescription>
                Enter your details to get started.
            </CardDescription>
            </CardHeader>

            <CardContent>
            <form onSubmit={handleSubmit}>
                <div className="space-y-2">
                <Label htmlFor="username">Username</Label>

                <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                </div>

                <div className="mt-4 space-y-2">
                <Label htmlFor="email">Email</Label>

                <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                </div>

                <div className="mt-4 space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                        }
                        className="pr-10"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>
                
                {error && (
                    <p className="mt-4 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <Button
                className="mt-6 w-full"
                type="submit"
                disabled={loading}
                >
                {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="font-medium text-primary hover:underline">
                    Login
                </a>
                </p>
            </form>
            </CardContent>
        </Card>
        </main>
    );
    }