'use client';

import { useState } from 'react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function SubmitTicketForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        organization: '',
        platform: '',
        subject: '',
        description: '',
        contactNumber: '',
        attachment: null as File | null,
    });

    const [errors, setErrors] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, attachment: e.target.files[0] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.organization || !formData.platform || !formData.subject || !formData.description) {
            setErrors('Please fill in all required fields.');
            return;
        }

        if (formData.contactNumber && !/^\d{10,15}$/.test(formData.contactNumber)) {
            setErrors('Invalid contact number format.');
            return;
        }

        setIsSubmitting(true);
        setErrors(null);

        // Mock submission (remove API call)
        console.log('Form submitted with data:', formData);

        // Simulate delay
        setTimeout(() => {
            setIsSubmitting(false);
            alert('Ticket submitted successfully (mock)!');
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-md mt-6">
            <h1 className="text-2xl font-semibold mb-4">Submit a Ticket</h1>

            {errors && <div className="text-red-500 mb-4">{errors}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />

                <label className="block text-sm font-medium mb-1">Email</label>
                <Input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required />

                <div>
                    <label className="block text-sm font-medium mb-1">Organization</label>
                    <Select onValueChange={(val) => handleSelectChange('organization', val)} required>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Organization" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="org1">Msil</SelectItem>
                            <SelectItem value="org2">Rohtak</SelectItem>
                            <SelectItem value="org3">Udyog Vihar</SelectItem>
                            <SelectItem value="org4">Tag Avenue</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Platform</label>
                    <Select onValueChange={(val) => handleSelectChange('platform', val)} required>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Platform" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="web">Lighthouse</SelectItem>
                            <SelectItem value="mobile">Learn Tank</SelectItem>
                            <SelectItem value="desktop">Home Certify</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />

                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea name="description" placeholder="Describe your issue" value={formData.description} onChange={handleChange} required />

                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <Input name="contactNumber" placeholder="Contact Number (Optional)" value={formData.contactNumber} onChange={handleChange} />

                <div>
                    <label className="block text-sm font-medium mb-1">Attachment</label>
                    <Input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
            </form>
        </div>
    );
}
