import os

def generate_directory_structure(start_path, output_file):
    with open(output_file, "w", encoding="utf-8") as f:
        for root, dirs, files in os.walk(start_path):
            level = root.replace(start_path, "").count(os.sep)
            indent = " " * 4 * level
            folder_name = os.path.basename(root)

            # Write folder name
            f.write(f"{indent}📂 {folder_name}\n")

            # Skip listing files inside node_modules but keep the folder
            if folder_name == "node_modules":
                continue

            # Write file names
            sub_indent = " " * 4 * (level + 1)
            for file in files:
                f.write(f"{sub_indent}📄 {file}\n")

    print(f"Directory structure saved in '{output_file}'")

# Set directory path (Change this to your required directory)
directory_path = input("Enter the directory path: ")

# Output text file
output_file = "directory_structure.txt"

# Generate the directory structure
generate_directory_structure(directory_path, output_file)
