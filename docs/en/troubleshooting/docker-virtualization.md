# Fixing "Docker Virtualization not enabled on your machine" Error

## Symptom
When starting Docker Desktop on Windows, you receive the following warning alert:
> **"Docker Virtualization not enabled on your machine"** or **"Hardware assisted virtualization and data execution protection must be enabled in the BIOS"**

The Docker Desktop application fails to start and remains in a stopped state.

---

## Causes
This error occurs when Docker Desktop cannot access the hardware virtualization features of your CPU (Intel VT-x or AMD-V), or when the required Windows virtualization features (WSL 2 / Virtual Machine Platform) are disabled or blocked by conflicting software.

---

## Troubleshooting Steps

### Step 1: Check Virtualization Status in Task Manager
First, verify whether hardware virtualization is active on your host system:
1. Press `Ctrl + Shift + Esc` to open the **Task Manager**.
2. Go to the **Performance** tab on the left menu, then select **CPU**.
3. Look at the **Virtualization** status in the bottom right area:
   - If it shows **Enabled**: Hardware virtualization is active in the BIOS. The issue lies in your Windows configuration (proceed to Step 3).
   - If it shows **Disabled**: You must enable hardware virtualization in your computer's BIOS/UEFI settings (proceed to Step 2).

---

### Step 2: Enable Virtualization in BIOS/UEFI
If the status is **Disabled**, you need to reboot into BIOS/UEFI to turn on CPU virtualization:
1. Restart your computer. During boot, press the BIOS access key repeatedly (usually `F2`, `F10`, `F12`, or `Delete` depending on your motherboard brand like HP, Dell, Asus, Lenovo, Acer, etc.).
2. Locate the CPU configurations menu (commonly found under **Advanced**, **CPU Configuration**, or **Chipset** tab):
   - **For Intel CPUs:** Find and set **Intel Virtualization Technology**, **Intel VT-x**, or **Vanderpool** to **Enabled**.
   - **For AMD CPUs:** Find and set **SVM Mode** or **AMD-V** to **Enabled**.
3. Press `F10`, select **Yes** to save settings and restart your computer into Windows. Re-check the Virtualization status in Task Manager to confirm it is now **Enabled**.

---

### Step 3: Activate WSL 2 and Virtual Machine Platform on Windows
Docker Desktop requires the underlying Windows features to be active:
1. Open **PowerShell** as Administrator (right-click the Start menu button and choose *Terminal (Admin)* or *PowerShell (Admin)*).
2. Execute the following command to enable all necessary virtualization features for WSL 2:
   ```powershell
   wsl.exe --install --no-distribution
   ```
3. Once completed, **you must restart your computer** for Windows to apply the feature additions.

---

### Step 4: Check Conflicts with Anti-Cheat Software
Certain third-party antiviruses or game anti-cheat engines running at the kernel level can block Docker from accessing virtualization capabilities:
- **Riot Vanguard** (Anti-cheat program bundled with games like *Valorant* and *League of Legends*): This is a very common cause of virtualization blocks on development machines.
- **Solution:**
  1. Right-click the red Vanguard icon in the system tray (bottom-right corner of the taskbar).
  2. Select **Exit Vanguard** to temporarily shut down the anti-cheat.
  3. Relaunch Docker Desktop to verify if it boots successfully. If resolved, configure Vanguard to not run on system startup, and only start it manually when playing Riot games.
