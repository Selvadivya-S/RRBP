const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, phone, age: Number(age),
        bloodGroup, gender, role, location, password
      }),
    });

    const data = await response.json();
    console.log("API Response:", response, data); // <- check this in console

    if (response.ok) {
      toast.success("✅ Successfully Registered!");
    } else {
      toast.error(`❌ Registration Failed: ${data.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error(err);
    toast.error(`❌ Registration Failed: ${err.message}`);
  }
};
