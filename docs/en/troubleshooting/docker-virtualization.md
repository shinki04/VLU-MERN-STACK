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

### Step 2: Enable Virtualization in BIOS/UEFI via Windows Settings
If the virtualization status is **Disabled**, you can boot into the BIOS/UEFI settings directly from Windows Settings without pressing boot keys:
1. Open Windows **Settings** (shortcut `Windows + I`).
2. Go to **System** -> **Recovery**.
3. Under **Advanced startup**, click the **Restart now** button and confirm.
4. Your computer will reboot into a blue recovery screen. Select: **Troubleshoot** -> **Advanced options** -> **UEFI Firmware Settings** and click **Restart**.
5. The computer will automatically boot into the BIOS/UEFI setup. Locate CPU settings (typically under *Advanced*, *CPU Configuration*, or *Chipset*):
   - **For Intel CPUs:** Find and set **Intel Virtualization Technology**, **Intel VT-x**, or **Vanderpool** to **Enabled**.
   - **For AMD CPUs:** Find and set **SVM Mode** or **AMD-V** to **Enabled**.
6. Press `F10` and select **Yes** to save and reboot.

---

### Step 3: Activate WSL 2 and Virtual Machine Platform via Windows GUI
Instead of command-line tools, you can easily enable the operating system's virtualization features using the Windows interface:
1. Press the `Windows` key, search for **"Turn Windows features on or off"**, and press Enter to open the feature configuration window.
2. Scroll down and check the boxes for:
   - **Virtual Machine Platform**
   - **Windows Subsystem for Linux**
3. Click **OK** and wait for Windows to install the necessary files.
4. Click **Restart now** to reboot your computer and apply the changes.

---

### Step 4: Check Conflicts with Anti-Cheat Software
Certain third-party antiviruses or game anti-cheat engines running at the kernel level can block Docker from accessing virtualization capabilities:
- **Riot Vanguard** (Anti-cheat program bundled with games like *Valorant* and *League of Legends*): This is a very common cause of virtualization blocks on development machines.
- **Solution:**
  1. Right-click the red Vanguard icon in the system tray (bottom-right corner of the taskbar).
  2. Select **Exit Vanguard** to temporarily shut down the anti-cheat.
  3. Relaunch Docker Desktop to verify if it boots successfully. If resolved, configure Vanguard to not run on system startup, and only start it manually when playing Riot games.
