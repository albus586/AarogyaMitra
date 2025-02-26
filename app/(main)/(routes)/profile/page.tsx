"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Mr. Pranav Bafna",
    email: "pranavbafna586@gmail.com",
    sex: "Male",
    age: "20",
    blood: "B+",
    status: "Active",
    weight: "75",
    height: "180",
    bmi: "23.15",
  });

  const [statsData, setStatsData] = useState({
    bodyFat: "18",
    bodyFatStatus: "Within healthy range",
    muscleMass: "65",
    muscleMassStatus: "Good muscle composition",
  });

  const [mealsData, setMealsData] = useState([
    {
      name: "Breakfast",
      time: "8:00 AM",
      calories: "420",
      items: ["Oatmeal", "Banana", "Protein Shake"],
    },
    {
      name: "Lunch",
      time: "1:00 PM",
      calories: "650",
      items: ["Grilled Chicken", "Brown Rice", "Vegetables"],
    },
    {
      name: "Dinner",
      time: "7:00 PM",
      calories: "550",
      items: ["Fish", "Quinoa", "Green Salad"],
    },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
      // Automatically calculate BMI when weight or height changes
      ...(field === "weight" || field === "height"
        ? {
            bmi: (
              Number(field === "weight" ? value : prev.weight) /
              Math.pow(
                Number(field === "height" ? value : prev.height) / 100,
                2
              )
            ).toFixed(2),
          }
        : {}),
    }));
  };

  const handleStatsChange = (field: string, value: string) => {
    setStatsData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMealChange = (
    index: number,
    field: string,
    value: string | string[]
  ) => {
    setMealsData((prev) =>
      prev.map((meal, i) => (i === index ? { ...meal, [field]: value } : meal))
    );
  };

  const handleMealItemChange = (
    mealIndex: number,
    itemIndex: number,
    value: string
  ) => {
    setMealsData((prev) =>
      prev.map((meal, i) =>
        i === mealIndex
          ? {
              ...meal,
              items: meal.items.map((item, j) =>
                j === itemIndex ? value : item
              ),
            }
          : meal
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-indigo-100/50 transition-colors backdrop-blur-sm"
          onClick={() => router.push("/home#home")}
        >
          <ArrowLeft size={20} />
          Back to Home
        </Button>

        {/* Profile Section */}
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-md rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl border border-white/20">
          <div className="flex items-start gap-8">
            <div className="relative group">
              <Image
                src="/men.png"
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full ring-4 ring-gray-50"
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {isEditing ? (
                    <Input
                      value={profileData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="text-2xl font-bold h-auto py-1"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profileData.name}
                    </h1>
                  )}
                  {isEditing ? (
                    <Input
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="text-sm text-gray-500 h-auto py-1"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">{profileData.email}</p>
                  )}
                </div>
                <Button
                  variant={isEditing ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <X size={16} /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} /> Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Sex", field: "sex" },
                  { label: "Age", field: "age" },
                  { label: "Blood", field: "blood" },
                  { label: "Status", field: "status" },
                  { label: "Weight (kg)", field: "weight" },
                  { label: "Height (cm)", field: "height" },
                  { label: "BMI", field: "bmi", readonly: true },
                  {
                    label: "Current Date",
                    field: "date",
                    value: new Date().toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                    readonly: true,
                  },
                ].map((item) => (
                  <div key={item.field} className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      {item.label}
                    </p>
                    {isEditing && !item.readonly ? (
                      <Input
                        value={
                          profileData[item.field as keyof typeof profileData]
                        }
                        onChange={(e) =>
                          handleInputChange(item.field, e.target.value)
                        }
                        className="h-8"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">
                        {item.value ||
                          profileData[item.field as keyof typeof profileData]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setIsEditing(false)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Updated Statistics Section */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              User Statistics
            </h2>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:bg-emerald-100/50"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Stats
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Body Fat",
                value: statsData.bodyFat,
                status: statsData.bodyFatStatus,
                field: "bodyFat",
                statusField: "bodyFatStatus",
                gradient: "from-blue-500/10 via-blue-400/10 to-blue-300/10",
                hoverGradient:
                  "hover:from-blue-500/20 hover:via-blue-400/20 hover:to-blue-300/20",
              },
              {
                title: "Muscle Mass",
                value: statsData.muscleMass,
                status: statsData.muscleMassStatus,
                field: "muscleMass",
                statusField: "muscleMassStatus",
                gradient:
                  "from-purple-500/10 via-purple-400/10 to-purple-300/10",
                hoverGradient:
                  "hover:from-purple-500/20 hover:via-purple-400/20 hover:to-purple-300/20",
              },
            ].map((stat) => (
              <Card
                key={stat.field}
                className={`transition-all duration-300 bg-gradient-to-br ${stat.gradient} ${stat.hoverGradient} backdrop-blur-md border border-white/20`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={stat.value}
                        onChange={(e) =>
                          handleStatsChange(stat.field, e.target.value)
                        }
                        className="text-2xl font-bold h-auto py-1"
                      />
                      <Input
                        value={
                          statsData[stat.statusField as keyof typeof statsData]
                        }
                        onChange={(e) =>
                          handleStatsChange(stat.statusField, e.target.value)
                        }
                        className="text-xs text-green-500"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stat.value}
                        {stat.field === "bodyFat" ? "%" : " kg"}
                      </div>
                      <p className="text-xs text-green-500">{stat.status}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Updated Meal Plan Section with larger text */}
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Daily Meal Plan
            </h2>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:bg-indigo-100/50"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Meals
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {mealsData.map((meal, mealIndex) => (
              <Card
                key={mealIndex}
                className={`transition-all duration-300 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5 hover:from-indigo-500/10 hover:via-purple-500/10 hover:to-blue-500/10 backdrop-blur-md border border-white/20`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    {isEditing ? (
                      <>
                        <Input
                          value={meal.name}
                          onChange={(e) =>
                            handleMealChange(mealIndex, "name", e.target.value)
                          }
                          className="w-32 text-lg"
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            value={meal.calories}
                            onChange={(e) =>
                              handleMealChange(
                                mealIndex,
                                "calories",
                                e.target.value
                              )
                            }
                            className="w-20 text-right text-lg"
                          />
                          <span className="text-green-600 text-lg">kcal</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-semibold text-gray-800">
                          {meal.name}
                        </span>
                        <span className="text-lg font-medium text-green-600">
                          {meal.calories} kcal
                        </span>
                      </>
                    )}
                  </CardTitle>
                  {isEditing ? (
                    <Input
                      value={meal.time}
                      onChange={(e) =>
                        handleMealChange(mealIndex, "time", e.target.value)
                      }
                      className="text-base text-muted-foreground w-28"
                    />
                  ) : (
                    <p className="text-base text-muted-foreground">
                      {meal.time}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {meal.items.map((item, itemIndex) =>
                      isEditing ? (
                        <Input
                          key={itemIndex}
                          value={item}
                          onChange={(e) =>
                            handleMealItemChange(
                              mealIndex,
                              itemIndex,
                              e.target.value
                            )
                          }
                          className="w-36 text-base"
                        />
                      ) : (
                        <Badge
                          key={itemIndex}
                          variant="secondary"
                          className="text-base px-3 py-1"
                        >
                          {item}
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
