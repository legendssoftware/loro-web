import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, AccessLevel, AccountStatus } from "@/helpers/users";

interface StaffFormProps {
  user?: User;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitText: string;
  isSubmitting?: boolean;
}

export const StaffForm = ({
  user,
  onSubmit,
  submitText,
  isSubmitting,
}: StaffFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.photoURL || null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label
            htmlFor="name"
            className="font-body font-normal uppercase text-[10px]"
          >
            First Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="John"
            defaultValue={user?.name}
            required
            className="text-[12px]"
          />
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="surname"
            className="font-body font-normal uppercase text-[10px]"
          >
            Last Name
          </Label>
          <Input
            id="surname"
            name="surname"
            placeholder="Doe"
            defaultValue={user?.surname}
            required
            className="text-[12px]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label
            htmlFor="email"
            className="font-body font-normal uppercase text-[10px]"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jdoe@loro.co.za"
            defaultValue={user?.email}
            required
            className="text-[12px]"
          />
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="username"
            className="font-body font-normal uppercase text-[10px]"
          >
            Username
          </Label>
          <Input
            id="username"
            name="username"
            placeholder="jdoe"
            defaultValue={user?.username}
            required
            className="text-[12px]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label
            htmlFor="phone"
            className="font-body font-normal uppercase text-[10px]"
          >
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+27 11 765 2357"
            defaultValue={user?.phone}
            required
            className="text-[12px]"
          />
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="accessLevel"
            className="font-body font-normal uppercase text-[10px]"
          >
            Access Level
          </Label>
          <Select name="accessLevel" defaultValue={user?.accessLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={AccessLevel.USER}
                className="font-body text-[10px] uppercase"
              >
                User
              </SelectItem>
              <SelectItem
                value={AccessLevel.ADMIN}
                className="font-body text-[10px] uppercase"
              >
                Admin
              </SelectItem>
              <SelectItem
                value={AccessLevel.MANAGER}
                className="font-body text-[10px] uppercase"
              >
                Manager
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {user && (
        <div className="grid gap-2">
          <Label
            htmlFor="status"
            className="font-body font-normal uppercase text-[10px]"
          >
            Account Status
          </Label>
          <Select name="status" defaultValue={user?.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={AccountStatus.ACTIVE}
                className="font-body text-[10px] uppercase"
              >
                Active
              </SelectItem>
              <SelectItem
                value={AccountStatus.INACTIVE}
                className="font-body text-[10px] uppercase"
              >
                Inactive
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {!user && (
        <div className="grid gap-2">
          <Label
            htmlFor="password"
            className="font-body font-normal uppercase text-[10px]"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="****************************"
            required
            className="text-[12px]"
          />
        </div>
      )}
      <div className="grid gap-2">
        <Label
          htmlFor="photo"
          className="font-body font-normal uppercase text-[10px]"
        >
          Profile Photo
        </Label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("photo")?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              <p className="font-body font-normal uppercase text-[9px]">
                Upload Photo
              </p>
            </Button>
          </div>
          {imagePreview && (
            <div className="relative group">
              <Avatar className="w-16 h-16 ring-2 ring-primary">
                <AvatarImage src={imagePreview} alt="Preview" />
                <AvatarFallback className="text-sm text-white uppercase bg-black font-body">
                  {user ? `${user.name[0]}${user.surname[0]}` : "Preview"}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute w-6 h-6 p-0 transition-opacity rounded-full opacity-0 -top-2 -right-2 group-hover:opacity-100"
                onClick={() => setImagePreview(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          size="sm"
          className="text-[10px] font-normal text-white uppercase font-body"
          disabled={isSubmitting}
        >
          {submitText}
        </Button>
      </DialogFooter>
    </form>
  );
};
