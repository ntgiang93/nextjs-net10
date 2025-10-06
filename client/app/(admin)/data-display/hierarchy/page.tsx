'use client'
import {Select, SelectItem, SelectSection} from "@heroui/react";


export default function Hierarchy() {
  const animals = [
    {key: "cat", label: "Cat"},
    {key: "dog", label: "Dog"},
    {key: "elephant", label: "Elephant"},
    {key: "lion", label: "Lion"},
    {key: "tiger", label: "Tiger"},
    {key: "giraffe", label: "Giraffe"},
    {key: "dolphin", label: "Dolphin"},
    {key: "penguin", label: "Penguin"},
    {key: "zebra", label: "Zebra"},
    {key: "shark", label: "Shark"},
    {key: "whale", label: "Whale"},
    {key: "otter", label: "Otter"},
    {key: "crocodile", label: "Crocodile"},
  ];
  const variants = ["flat", "bordered", "underlined", "faded"];

  return (
    <div className="w-full flex flex-col gap-4">
      <Select className="max-w-xs" label="Favorite Animal" placeholder="Select an animal">
        <SelectSection showDivider title="Mammals">
          <SelectItem key="Lion">Lion</SelectItem>
          <SelectItem key="Tiger">Tiger</SelectItem>
          <SelectItem key="Elephant">Elephant</SelectItem>
          <SelectItem key="Kangaroo">Kangaroo</SelectItem>
          <SelectItem key="Panda">Panda</SelectItem>
          <SelectItem key="Giraffe">Giraffe</SelectItem>
          <SelectItem key="Zebra">Zebra</SelectItem>
          <SelectItem key="Cheetah">Cheetah</SelectItem>
          <SelectSection showDivider title="21212">
            <SelectItem key="1">Lion</SelectItem>
            <SelectItem key="Ti2ger">Tiger</SelectItem>
            <SelectItem key="Ele3phant">Elephant</SelectItem>
            <SelectItem key="Kang4aroo">Kangaroo</SelectItem>
            <SelectItem key="Pan5da">Panda</SelectItem>
            <SelectItem key="Gir6affe">Giraffe</SelectItem>
            <SelectItem key="Ze7bra">Zebra</SelectItem>
            <SelectItem key="Chee7tah">Cheetah</SelectItem>
          </SelectSection>
        </SelectSection>
        <SelectSection title="Birds">
          <SelectItem key="Eagle">Eagle</SelectItem>
          <SelectItem key="Parrot">Parrot</SelectItem>
          <SelectItem key="Penguin">Penguin</SelectItem>
          <SelectItem key="Ostrich">Ostrich</SelectItem>
          <SelectItem key="Peacock">Peacock</SelectItem>
          <SelectItem key="Swan">Swan</SelectItem>
          <SelectItem key="Falcon">Falcon</SelectItem>
          <SelectItem key="Flamingo">Flamingo</SelectItem>
        </SelectSection>
      </Select>
    </div>
  );
}
