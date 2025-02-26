"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TriangleAlert, Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [form, setForm] = useState({
    name: "asd",
    email: "asd@gmail.com",
    password: "asd@gmail.com",
    confirmPassword: "asd@gmail.com",
    userType: "Patient",
    age: "21",
    phoneNo: "7756966720",
    bp: "25",
    weight: "65",
    heartRate: "100",
    medicalHistory: "None",
    allergies: "None",
    reasonForVisit: "None",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        // Auto sign in after successful registration
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });

        if (signInRes?.ok) {
          toast({
            title: "Success!",
            description: "Account created and logged in successfully",
            className: "bg-green-500 text-white",
          });

          // Redirect based on user type
          const redirectUrl =
            form.userType === "Doctor" ? "/doctorside" : "/home";
          router.push(redirectUrl);
        }
      } else {
        setError(data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const handleProvider = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: "github" | "google"
  ) => {
    event.preventDefault();
    signIn(value, { callbackUrl: "/" }).then(() => {
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((session) => {
          toast({
            title: "Success! 🎉",
            description: "Logged in successfully with " + value,
            variant: "default",
            duration: 5000,
            className: "bg-green-500 text-white border-none",
          });

          // Small delay to ensure toast is visible
          setTimeout(() => {
            const redirectUrl =
              session?.user?.userType === "Doctor" ? "/doctorside" : "/home";
            router.push(redirectUrl);
          }, 1000);
        });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-blue-100">
      <Card className="w-[90%] max-w-[800px] p-6 animate-fade-in-up">
        <div className="flex items-center mb-4">
          <ArrowLeft
            className="text-gray-700 cursor-pointer hover:scale-110 transition"
            onClick={() => router.push("/")} // Redirect to home page
          />
          <h1 className="text-lg font-semibold text-gray-700 ml-2">
            Back to Home
          </h1>
        </div>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            Create an ArogyaMitra Account
          </CardTitle>
          <CardDescription className="text-sm text-center text-gray-600">
            ArogyaMitra: Affordable Health Tracking System
          </CardDescription>
        </CardHeader>
        {!!error && (
          <div className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-600 mb-6">
            <TriangleAlert />
            <p>{error}</p>
          </div>
        )}
        <CardContent className="px-2 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Full name
                  </label>
                  <Input
                    type="text"
                    disabled={pending}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Email
                  </label>
                  <Input
                    type="email"
                    disabled={pending}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    disabled={pending}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </div>
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Confirm Password
                  </label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    disabled={pending}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </div>
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Age
                  </label>
                  <Input
                    type="number"
                    disabled={pending}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    disabled={pending}
                    value={form.phoneNo}
                    onChange={(e) =>
                      setForm({ ...form, phoneNo: e.target.value })
                    }
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Blood Pressure
                  </label>
                  <Input
                    type="text"
                    disabled={pending}
                    value={form.bp}
                    onChange={(e) => setForm({ ...form, bp: e.target.value })}
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    disabled={pending}
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Heart Rate (bpm)
                  </label>
                  <Input
                    type="number"
                    disabled={pending}
                    value={form.heartRate}
                    onChange={(e) =>
                      setForm({ ...form, heartRate: e.target.value })
                    }
                    required
                    className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Medical History
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-md transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 min-h-[30px]"
                    disabled={pending}
                    value={form.medicalHistory}
                    onChange={(e) =>
                      setForm({ ...form, medicalHistory: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                    Allergies
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-md transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 min-h-[30px]"
                    disabled={pending}
                    value={form.allergies}
                    onChange={(e) =>
                      setForm({ ...form, allergies: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="relative col-span-2">
              <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
                Reason for Visit
              </label>
              <textarea
                className="w-full p-3 border rounded-md transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 min-h-[50px]"
                disabled={pending}
                value={form.reasonForVisit}
                onChange={(e) =>
                  setForm({ ...form, reasonForVisit: e.target.value })
                }
                required
              />
            </div>

            <select
              disabled={pending}
              value={form.userType}
              onChange={(e) => setForm({ ...form, userType: e.target.value })}
              required
              className="w-full p-3 border rounded-md transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              size="lg"
              disabled={pending}
            >
              {pending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin mr-2">⌛</div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <Separator className="my-4" />
          <div className="flex my-2 justify-evenly mx-auto items-center">
            <Button
              onClick={(e) => handleProvider(e, "google")}
              variant="outline"
              size="lg"
              className="bg-slate-300 hover:bg-slate-400 hover:scale-110"
            >
              <FcGoogle className="size-8 left-2.5 top-2.5" />
            </Button>
            <Button
              onClick={(e) => handleProvider(e, "github")}
              variant="outline"
              size="lg"
              className="bg-slate-300 hover:bg-slate-400 hover:scale-110"
            >
              <FaGithub className="size-8 left-2.5 top-2.5" />
            </Button>
          </div>
          <p className="text-center text-sm mt-2 text-gray-600">
            Already have an account?
            <Link
              className="text-sky-700 ml-4 hover:underline cursor-pointer"
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
export default SignUp;
